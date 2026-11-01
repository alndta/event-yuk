import { createHmac, randomUUID } from 'node:crypto';
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
  DocumentStore,
  KycDocumentKind,
  KycRepository,
  KycStatus,
  OtpRepository,
  ProfileRecord,
  ProfileWithUser,
  UserRecord,
  UserRepository,
} from './ports';
import type { RegisterInput, SetRoleInput, UpdateProfileInput } from './schemas';

const MAX_DOC_BYTES = 5 * 1024 * 1024;

/** Reads the real image type from the first bytes of the file. */
function detectImage(b: Buffer): { mime: string; ext: string } | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: 'png' };
  return null;
}

type Lang = 'id' | 'en';

/** The email that carries a code, in the language the visitor was using. */
function codeEmail(kind: 'register' | 'reset', lang: Lang, code: string) {
  const text = {
    id: {
      register: { subject: 'Kode verifikasi Event Yuk', title: 'Kode verifikasi Event Yuk', intro: 'Masukkan kode ini untuk menyelesaikan pendaftaran:' },
      reset: { subject: 'Kode atur ulang kata sandi Event Yuk', title: 'Atur ulang kata sandi', intro: 'Masukkan kode ini untuk membuat kata sandi baru. Abaikan email ini kalau bukan kamu yang meminta:' },
      foot: 'Berlaku 10 menit. Jangan bagikan kode ini ke siapa pun.',
      plain: (c: string) => `Kode Event Yuk kamu: ${c}. Berlaku 10 menit. Jangan bagikan kode ini ke siapa pun.`,
    },
    en: {
      register: { subject: 'Your Event Yuk verification code', title: 'Event Yuk verification code', intro: 'Enter this code to finish creating your account:' },
      reset: { subject: 'Your Event Yuk password reset code', title: 'Reset your password', intro: 'Enter this code to set a new password. Ignore this email if you did not ask for it:' },
      foot: 'Valid for 10 minutes. Do not share this code with anyone.',
      plain: (c: string) => `Your Event Yuk code: ${c}. Valid for 10 minutes. Do not share it with anyone.`,
    },
  }[lang];
  const k = text[kind];
  return {
    subject: k.subject,
    text: text.plain(code),
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#172D46">${k.title}</h2>
      <p>${k.intro}</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#172D46">${escapeHtml(code)}</p>
      <p style="color:#64748b;font-size:13px">${text.foot}</p>
    </div>`,
  };
}

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
  /** True for accounts listed in ADMIN_EMAILS; the web app uses it to show the review page. */
  is_admin: boolean;
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
  documents: DocumentStore;
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
      is_admin: this.d.env.adminEmails.includes(user.email.toLowerCase()),
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

  async requestOtp(emailInput: string, lang: Lang = 'id'): Promise<{ preview?: string }> {
    return this.issueCode(emailInput.toLowerCase(), 'register', lang);
  }

  /** Same code mechanism as sign-up, under its own identifier so the two cannot be mixed up. */
  private async issueCode(identifier: string, kind: 'register' | 'reset', lang: Lang, mailTo = identifier): Promise<{ preview?: string }> {
    const recent = await this.d.otps.countSince(identifier, new Date(Date.now() - OTP_WINDOW_MS));
    if (recent >= OTP_MAX_REQUESTS) {
      throw tooManyRequests('Terlalu sering meminta kode. Tunggu beberapa menit lalu coba lagi.');
    }

    const code = generateOtp();
    await this.d.otps.create({
      identifier,
      codeHash: hashOtp(identifier, code, this.otpKey),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    try {
      await this.d.mailer.send({ to: mailTo, ...codeEmail(kind, lang, code) });
    } catch (err) {
      logger.error('otp email failed', { error: err instanceof Error ? err.message : String(err) });
      if (this.d.env.isProduction) throw badGateway('Email belum bisa dikirim. Coba lagi sebentar lagi.');
    }

    return this.d.env.exposeOtpPreview ? { preview: code } : {};
  }

  /**
   * Asks for a reset code. The answer is the same whether or not the email has an account,
   * so this cannot be used to find out who is registered.
   */
  async requestPasswordReset(emailInput: string, lang: Lang = 'id'): Promise<{ preview?: string }> {
    const email = emailInput.toLowerCase();
    if (!(await this.d.users.findByEmail(email))) return {};
    return this.issueCode(`reset:${email}`, 'reset', lang, email);
  }

  async resetPassword(emailInput: string, code: string, newPassword: string): Promise<void> {
    const email = emailInput.toLowerCase();
    await this.consumeOtp(`reset:${email}`, code);
    const user = await this.d.users.findByEmail(email);
    if (!user) throw badRequest('Kode OTP tidak valid atau sudah kedaluwarsa. Minta kode baru.');
    await this.d.users.update(user.id, { passwordHash: await hashPassword(newPassword) });
  }

  private async consumeOtp(identifierInput: string, code: string): Promise<void> {
    const identifier = identifierInput.toLowerCase();
    const record = await this.d.otps.findActive(identifier, new Date());
    const invalid = badRequest('Kode OTP tidak valid atau sudah kedaluwarsa. Minta kode baru.');
    if (!record || record.attempts >= OTP_MAX_ATTEMPTS) throw invalid;
    if (!safeEqualHex(record.codeHash, hashOtp(identifier, code, this.otpKey))) {
      await this.d.otps.incrementAttempts(record.id);
      throw invalid;
    }
    await this.d.otps.markUsed(record.id);
  }

  // ---------------------------------------------------------------- sign up / sign in

  async register(input: RegisterInput): Promise<Session> {
    await this.consumeOtp(input.email.toLowerCase(), input.otp_code);
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
    const have = new Set((await this.d.kyc.listDocuments(userId)).map((d) => d.kind));
    if (!have.has('KTP') || !have.has('SELFIE')) throw badRequest('Unggah foto KTP dan selfie dulu sebelum mengirim pengajuan.');
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
    const docs = new Set((await this.d.kyc.listDocuments(userId)).map((d) => d.kind));
    return {
      status: user.kycStatus,
      reject_reason: last?.status === 'REJECTED' ? last.rejectReason : null,
      submitted_at: last?.createdAt ?? null,
      documents: { ktp: docs.has('KTP'), selfie: docs.has('SELFIE') },
    };
  }

  /**
   * Stores one identity photo. The file type is read from the bytes, not from what the browser claims,
   * and the file goes to private storage under the account's own folder.
   */
  async uploadKycDocument(userId: string, kind: KycDocumentKind, body: Buffer): Promise<void> {
    const user = await this.d.users.findById(userId);
    if (!user) throw notFound('Akun tidak ditemukan.');
    if (user.kycStatus === 'VERIFIED') throw conflict('Akunmu sudah terverifikasi.');
    if (user.kycStatus === 'PENDING') throw conflict('Pengajuanmu sedang diperiksa, foto tidak bisa diganti sekarang.');
    if (!Buffer.isBuffer(body) || body.length === 0) throw badRequest('Foto belum terkirim. Pilih berkas JPG atau PNG.');
    if (body.length > MAX_DOC_BYTES) throw badRequest('Ukuran foto maksimal 5 MB.');
    const type = detectImage(body);
    if (!type) throw badRequest('Berkas harus berupa foto JPG atau PNG.');
    const path = `${userId}/${kind.toLowerCase()}-${randomUUID()}.${type.ext}`;
    await this.d.documents.put(path, body, type.mime);
    await this.d.kyc.addDocument({ userId, kind, path, contentType: type.mime, size: body.length });
  }

  /** Short-lived links so a reviewer can look at the photos; each look is written to the log. */
  async kycDocumentLinks(reviewerId: string, userId: string) {
    if (!(await this.d.users.findById(userId))) throw notFound('Akun tidak ditemukan.');
    const docs = await this.d.kyc.listDocuments(userId);
    logger.info('kyc documents viewed', { reviewer: reviewerId, subject: userId, count: docs.length });
    return Promise.all(docs.map(async (d) => ({ kind: d.kind, url: await this.d.documents.signedUrl(d.path, 120), expires_in: 120 })));
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
    // A rejected submission has no further use for its photos, so they go right away.
    if (decision === 'UNVERIFIED') await this.deletePhotos(await this.d.kyc.takeDocuments(userId));
  }

  /** Deletes the files and records of the given photos. A failure is logged, not thrown, so a decision is never undone by it. */
  private async deletePhotos(docs: { path: string }[]): Promise<void> {
    if (docs.length === 0) return;
    try {
      await this.d.documents.remove(docs.map((d) => d.path));
    } catch (err) {
      logger.error('kyc photo deletion failed', { count: docs.length, error: err instanceof Error ? err.message : String(err) });
    }
  }

  /** Run on a schedule: approved photos are kept for KYC_APPROVED_PHOTO_DAYS and then deleted. */
  async purgeApprovedPhotos(now = new Date()): Promise<number> {
    const cutoff = new Date(now.getTime() - this.d.env.kycApprovedPhotoDays * 24 * 60 * 60 * 1000);
    const due = await this.d.kyc.takeApprovedDocumentsBefore(cutoff);
    await this.deletePhotos(due);
    if (due.length > 0) logger.info('kyc approved photos deleted', { count: due.length });
    return due.length;
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
