import { createHmac } from 'node:crypto';
import type { Env } from '../../shared/config/env';
import { deriveKey, generateOtp, hashOtp, safeEqualHex } from '../../shared/crypto/otp';
import { hashPassword, verifyAgainstDummy, verifyPassword } from '../../shared/crypto/password';
import type { TokenService } from '../../shared/crypto/jwt';
import { badGateway, badRequest, conflict, notFound, tooManyRequests, unauthorized } from '../../shared/errors';
import type { EventBus } from '../../shared/events/bus';
import { logger } from '../../shared/logger';
import { escapeHtml, type Mailer } from '../../shared/mail/mailer';
import type { AuthContext, Role } from '../../shared/types';
import type {
  BankAccount,
  GoogleIdentityVerifier,
  KycRepository,
  KycStatus,
  OtpRepository,
  ProfileRecord,
  ProfileWithUser,
  UserRecord,
  UserRepository,
} from './ports';
import type { RegisterInput, SetRoleInput, UpdateProfileInput } from './schemas';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_WINDOW_MS = 10 * 60 * 1000;
const OTP_MAX_REQUESTS = 3;
const OTP_MAX_ATTEMPTS = 5;

/** Fields safe to show the account owner. Never includes the password hash. */
export interface UserView {
  id: string;
  full_name: string;
  email: string;
  phone_wa: string | null;
  kyc_status: KycStatus;
  active_role: Role | null;
  business_name: string;
  city_region: string | null;
  bank_account: BankAccount | null;
}

export interface Session {
  token: string;
  user: UserView;
  activeRole: Role | null;
  has_role: boolean;
}

/** What other modules and anonymous visitors may see about an account. */
export interface PublicProfile {
  userId: string;
  role: Role;
  name: string;
  cityRegion: string | null;
  ratingAvg: number | null;
  verified: boolean;
}

export interface IdentityDeps {
  users: UserRepository;
  otps: OtpRepository;
  kyc: KycRepository;
  google: GoogleIdentityVerifier;
  mailer: Mailer;
  tokens: TokenService;
  bus: EventBus;
  env: Env;
}

export class IdentityService {
  private readonly otpKey: string;

  constructor(private readonly d: IdentityDeps) {
    this.otpKey = deriveKey(d.env.jwtSecret, 'otp');
  }

  // ---------------------------------------------------------------- views

  private view(user: UserRecord, profile: ProfileRecord | null): UserView {
    return {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      phone_wa: user.phoneWa,
      kyc_status: user.kycStatus,
      active_role: profile?.role ?? null,
      business_name: profile?.businessName ?? user.fullName,
      city_region: profile?.cityRegion ?? null,
      bank_account: profile?.bankAccount ?? null,
    };
  }

  private async session(user: UserRecord): Promise<Session> {
    const profile = await this.d.users.getProfile(user.id);
    return {
      token: this.d.tokens.sign(user.id),
      user: this.view(user, profile),
      activeRole: profile?.role ?? null,
      has_role: Boolean(profile),
    };
  }

  // ---------------------------------------------------------------- token to caller

  async authenticate(token: string): Promise<AuthContext | null> {
    const userId = this.d.tokens.verify(token);
    if (!userId) return null;
    const user = await this.d.users.findById(userId);
    if (!user) return null;
    const profile = await this.d.users.getProfile(user.id);
    return { userId: user.id, email: user.email, role: profile?.role ?? null };
  }

  // ---------------------------------------------------------------- OTP

  async requestOtp(emailInput: string): Promise<{ preview?: string }> {
    const email = emailInput.toLowerCase();
    const recent = await this.d.otps.countSince(email, new Date(Date.now() - OTP_WINDOW_MS));
    if (recent >= OTP_MAX_REQUESTS) {
      throw tooManyRequests('Terlalu sering meminta kode. Tunggu beberapa menit lalu coba lagi.');
    }

    const code = generateOtp();
    await this.d.otps.create({
      identifier: email,
      codeHash: hashOtp(email, code, this.otpKey),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    try {
      await this.d.mailer.send({
        to: email,
        subject: 'Kode verifikasi Event Yuk',
        text: `Kode verifikasi Event Yuk kamu: ${code}. Berlaku 10 menit. Jangan bagikan kode ini ke siapa pun.`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#172D46">Kode verifikasi Event Yuk</h2>
          <p>Masukkan kode ini untuk menyelesaikan pendaftaran:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#172D46">${escapeHtml(code)}</p>
          <p style="color:#64748b;font-size:13px">Berlaku 10 menit. Jangan bagikan kode ini ke siapa pun.</p>
        </div>`,
      });
    } catch (err) {
      logger.error('otp email failed', { error: err instanceof Error ? err.message : String(err) });
      if (this.d.env.isProduction) throw badGateway('Email belum bisa dikirim. Coba lagi sebentar lagi.');
    }

    return this.d.env.exposeOtpPreview ? { preview: code } : {};
  }

  private async consumeOtp(emailInput: string, code: string): Promise<void> {
    const email = emailInput.toLowerCase();
    const record = await this.d.otps.findActive(email, new Date());
    const invalid = badRequest('Kode OTP tidak valid atau sudah kedaluwarsa. Minta kode baru.');
    if (!record || record.attempts >= OTP_MAX_ATTEMPTS) throw invalid;
    if (!safeEqualHex(record.codeHash, hashOtp(email, code, this.otpKey))) {
      await this.d.otps.incrementAttempts(record.id);
      throw invalid;
    }
    await this.d.otps.markUsed(record.id);
  }

  // ---------------------------------------------------------------- sign up / sign in

  async register(input: RegisterInput): Promise<Session> {
    await this.consumeOtp(input.email, input.otp_code);
    if (await this.d.users.findByEmail(input.email)) throw conflict('Email ini sudah terdaftar. Silakan masuk.');

    const user = await this.d.users.create({
      fullName: input.full_name,
      email: input.email,
      phoneWa: input.phone_wa ?? null,
      passwordHash: await hashPassword(input.password),
    });

    const role = input.primary_role ?? input.initial_role;
    if (role) {
      await this.d.users.createProfile({ userId: user.id, role, businessName: input.full_name, cityRegion: null });
    }
    await this.d.bus.emit('identity.user_registered', { userId: user.id });
    return this.session(user);
  }

  async login(email: string, password: string): Promise<Session> {
    const user = await this.d.users.findByEmail(email);
    if (!user) {
      await verifyAgainstDummy(password);
      throw unauthorized('Email atau kata sandi tidak sesuai.');
    }
    const check = await verifyPassword(password, user.passwordHash);
    if (!check.ok) throw unauthorized('Email atau kata sandi tidak sesuai.');
    if (check.needsRehash) await this.d.users.update(user.id, { passwordHash: await hashPassword(password) });
    return this.session(user);
  }

  async googleSync(accessToken: string): Promise<Session> {
    const identity = await this.d.google.verify(accessToken);
    if (!identity) throw unauthorized('Login Google tidak dapat diverifikasi.');
    const email = identity.email.toLowerCase();

    let user = await this.d.users.findByEmail(email);
    if (!user) {
      user = await this.d.users.create({ fullName: identity.fullName ?? email.split('@')[0], email, passwordHash: null });
      await this.d.bus.emit('identity.user_registered', { userId: user.id });
    }
    return this.session(user);
  }

  // ---------------------------------------------------------------- account

  async me(userId: string): Promise<UserView> {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');
    return this.view(user, await this.d.users.getProfile(userId));
  }

  async updateProfile(userId: string, patch: UpdateProfileInput): Promise<UserView> {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');

    const userPatch: Parameters<UserRepository['update']>[1] = {};
    if (patch.full_name) userPatch.fullName = patch.full_name;
    if (patch.phone_wa) userPatch.phoneWa = patch.phone_wa;
    if (Object.keys(userPatch).length) await this.d.users.update(userId, userPatch);

    const profilePatch: Parameters<UserRepository['updateProfile']>[1] = {};
    if (patch.business_name) profilePatch.businessName = patch.business_name;
    if (patch.city_region) profilePatch.cityRegion = patch.city_region;
    if (patch.bank_account) profilePatch.bankAccount = patch.bank_account;
    if (Object.keys(profilePatch).length) {
      if (!(await this.d.users.getProfile(userId))) throw badRequest('Pilih peran akun dulu sebelum mengisi profil usaha.');
      await this.d.users.updateProfile(userId, profilePatch);
    }
    return this.me(userId);
  }

  /**
   * Accounts cannot verify themselves. Submitting documents moves the account to PENDING; an
   * administrator makes the decision. The NIK is validated but not stored: keeping national ID
   * numbers needs encryption and a retention policy that has not been decided yet.
   */
  async submitKyc(userId: string, nik: string, bank: BankAccount): Promise<UserView> {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');
    if (!(await this.d.users.getProfile(userId))) throw badRequest('Pilih peran akun dulu sebelum mengajukan e-KYC.');
    if (user.kycStatus === 'VERIFIED') throw conflict('Akunmu sudah terverifikasi.');
    if (user.kycStatus === 'PENDING') throw conflict('Pengajuan e-KYC sebelumnya masih diproses.');
    const nikHash = createHmac('sha256', `${this.d.env.jwtSecret}:kyc-nik`).update(nik).digest('hex');
    await this.d.kyc.create({ userId, nikHash });
    await this.d.users.updateProfile(userId, { bankAccount: bank });
    await this.d.users.update(userId, { kycStatus: 'PENDING' });
    return this.me(userId);
  }

  async myKyc(userId: string) {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');
    const last = await this.d.kyc.latestFor(userId);
    return { status: user.kycStatus, reject_reason: last?.status === 'REJECTED' ? last.rejectReason : null, submitted_at: last?.createdAt ?? null };
  }

  async pendingKyc() {
    const rows = await this.d.kyc.listPending();
    return rows.map((r) => ({ user_id: r.userId, full_name: r.fullName, email: r.email, submitted_at: r.createdAt }));
  }

  /** Only a pending submission can be decided, and only by an admin (enforced at the route). */
  async decideKyc(reviewerId: string, userId: string, decision: 'VERIFIED' | 'UNVERIFIED', reason?: string): Promise<void> {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');
    if (user.kycStatus !== 'PENDING') throw conflict('Akun ini tidak sedang menunggu verifikasi.');
    if (decision === 'UNVERIFIED' && !reason) throw badRequest('Alasan penolakan wajib diisi.');
    await this.d.kyc.decide({ userId, reviewerId, status: decision === 'VERIFIED' ? 'APPROVED' : 'REJECTED', reason: reason ?? null });
    await this.d.users.update(userId, { kycStatus: decision });
  }

  async setRole(userId: string, input: SetRoleInput): Promise<UserView> {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');
    if (await this.d.users.getProfile(userId)) {
      throw conflict('Akun ini sudah punya peran tetap. Satu akun hanya bisa memegang satu peran.');
    }
    await this.d.users.createProfile({
      userId,
      role: input.role_type,
      businessName: input.business_name ?? user.fullName,
      cityRegion: input.city_region ?? null,
    });
    if (input.phone_wa) await this.d.users.update(userId, { phoneWa: input.phone_wa });
    return this.me(userId);
  }

  // ---------------------------------------------------------------- for other modules

  private toPublic(p: ProfileWithUser): PublicProfile {
    return {
      userId: p.userId,
      role: p.role,
      name: p.businessName ?? p.fullName,
      cityRegion: p.cityRegion,
      ratingAvg: p.ratingAvg,
      verified: p.kycStatus === 'VERIFIED',
    };
  }

  async getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const p = await this.d.users.getProfileWithUser(userId);
    return p ? this.toPublic(p) : null;
  }

  async listPublicProfiles(role?: Role): Promise<PublicProfile[]> {
    return (await this.d.users.listProfiles(role)).map((p) => this.toPublic(p));
  }

  async getContact(userId: string): Promise<{ fullName: string; email: string } | null> {
    const u = await this.d.users.findById(userId);
    return u ? { fullName: u.fullName, email: u.email } : null;
  }
}
