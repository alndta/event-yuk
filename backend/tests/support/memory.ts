import { randomUUID } from 'node:crypto';
import { conflict } from '../../src/shared/errors';
import type { AppDeps } from '../../src/app';
import { loadEnv } from '../../src/shared/config/env';
import type { MailMessage } from '../../src/shared/mail/mailer';
import type { GoogleIdentityVerifier } from '../../src/modules/identity';
import type { OtpRecord, OtpRepository, ProfileRecord, ProfileWithUser, UserRecord, UserRepository } from '../../src/modules/identity/ports';

export class MemoryUsers implements UserRepository {
  users = new Map<string, UserRecord>();
  profiles = new Map<string, ProfileRecord>();
  async findById(id: string) { return this.users.get(id) ?? null; }
  async findByEmail(email: string) { return [...this.users.values()].find((u) => u.email === email) ?? null; }
  async create(i: { fullName: string; email: string; phoneWa?: string | null; passwordHash?: string | null }) {
    if (await this.findByEmail(i.email)) throw conflict('Email sudah terdaftar.');
    const u: UserRecord = { id: randomUUID(), fullName: i.fullName, email: i.email, phoneWa: i.phoneWa ?? null, passwordHash: i.passwordHash ?? null, kycStatus: 'UNVERIFIED' };
    this.users.set(u.id, u);
    return u;
  }
  async update(id: string, patch: Partial<UserRecord>) { Object.assign(this.users.get(id)!, patch); }
  async getProfile(userId: string) { return this.profiles.get(userId) ?? null; }
  async createProfile(i: { userId: string; role: ProfileRecord['role']; businessName: string; cityRegion: string | null }) {
    if (this.profiles.has(i.userId)) throw conflict('Akun ini sudah punya peran.');
    const p: ProfileRecord = { userId: i.userId, role: i.role, businessName: i.businessName, cityRegion: i.cityRegion, ratingAvg: null, bankAccount: null };
    this.profiles.set(i.userId, p);
    return p;
  }
  async updateProfile(userId: string, patch: Partial<ProfileRecord>) { Object.assign(this.profiles.get(userId)!, patch); }
  async getProfileWithUser(userId: string): Promise<ProfileWithUser | null> {
    const p = this.profiles.get(userId), u = this.users.get(userId);
    return p && u ? { ...p, fullName: u.fullName, kycStatus: u.kycStatus } : null;
  }
  async listProfiles(role?: ProfileRecord['role']) {
    const out: ProfileWithUser[] = [];
    for (const id of this.profiles.keys()) {
      const x = await this.getProfileWithUser(id);
      if (x && (!role || x.role === role)) out.push(x);
    }
    return out;
  }
}

export class MemoryOtps implements OtpRepository {
  rows: (OtpRecord & { identifier: string; expiresAt: Date; used: boolean; createdAt: Date })[] = [];
  async create(i: { identifier: string; codeHash: string; expiresAt: Date }) {
    this.rows.push({ id: randomUUID(), attempts: 0, used: false, createdAt: new Date(), ...i });
  }
  async countSince(identifier: string, since: Date) { return this.rows.filter((r) => r.identifier === identifier && r.createdAt >= since).length; }
  async findActive(identifier: string, now: Date) {
    return [...this.rows].reverse().find((r) => r.identifier === identifier && !r.used && r.expiresAt > now) ?? null;
  }
  async incrementAttempts(id: string) { this.rows.find((r) => r.id === id)!.attempts++; }
  async markUsed(id: string) { this.rows.find((r) => r.id === id)!.used = true; }
}

/** Builds deps with in-memory identity storage; other modules get throwing stubs unless overridden. */
export function memoryDeps(over: Partial<AppDeps> = {}) {
  const sent: MailMessage[] = [];
  const google: GoogleIdentityVerifier = { verify: async () => null };
  const deps: AppDeps = {
    env: loadEnv({ NODE_ENV: 'test', JWT_SECRET: 'x'.repeat(40), EXPOSE_OTP_PREVIEW: 'true', ADMIN_EMAILS: 'admin@eventyuk.id' } as never),
    users: new MemoryUsers(),
    otps: new MemoryOtps(),
    events: {} as never, catalog: {} as never, proposals: {} as never, payments: {} as never,
    google,
    mailer: { send: async (m) => { sent.push(m); } },
    gateway: { configured: false } as never,
    disableRateLimits: true,
    ...over,
  };
  return { deps, sent };
}
