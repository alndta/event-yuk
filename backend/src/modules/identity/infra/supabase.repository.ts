import { AppError, conflict } from '../../../shared/errors';
import type { Db } from '../../../shared/db/supabase';
import type { Role } from '../../../shared/types';
import type { BankAccount, KycStatus, OtpRecord, OtpRepository, ProfileRecord, ProfileWithUser, UserRecord, UserRepository } from '../ports';

const USER_COLUMNS = 'id, full_name, email, phone_wa, password_hash, kyc_status';
const PROFILE_COLUMNS = 'user_id, role_type, business_name, city_region, rating_avg, bank_account';

function fail(error: { message: string; code?: string }, duplicateMessage?: string): never {
  if (error.code === '23505' && duplicateMessage) throw conflict(duplicateMessage);
  throw new AppError(500, 'DATABASE_ERROR', 'Terjadi kesalahan pada penyimpanan data.', undefined);
}

const toUser = (r: any): UserRecord => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  phoneWa: r.phone_wa ?? null,
  passwordHash: r.password_hash ?? null,
  kycStatus: (r.kyc_status ?? 'UNVERIFIED') as KycStatus,
});

const toBank = (v: unknown): BankAccount | null => {
  const b = v as Partial<BankAccount> | null;
  return b && typeof b === 'object' && b.account_number ? (b as BankAccount) : null;
};

const toProfile = (r: any): ProfileRecord => ({
  userId: r.user_id,
  role: r.role_type as Role,
  businessName: r.business_name ?? null,
  cityRegion: r.city_region ?? null,
  ratingAvg: r.rating_avg === null || r.rating_avg === undefined || Number(r.rating_avg) === 0 ? null : Number(r.rating_avg),
  bankAccount: toBank(r.bank_account),
});

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string) {
    const { data, error } = await this.db.from('users').select(USER_COLUMNS).eq('id', id).maybeSingle();
    if (error) fail(error);
    return data ? toUser(data) : null;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.db.from('users').select(USER_COLUMNS).eq('email', email).maybeSingle();
    if (error) fail(error);
    return data ? toUser(data) : null;
  }

  async create(input: { fullName: string; email: string; phoneWa?: string | null; passwordHash?: string | null }) {
    const { data, error } = await this.db
      .from('users')
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone_wa: input.phoneWa ?? null,
        password_hash: input.passwordHash ?? null,
        kyc_status: 'UNVERIFIED',
      })
      .select(USER_COLUMNS)
      .single();
    if (error) fail(error, 'Email ini sudah terdaftar.');
    return toUser(data);
  }

  async update(id: string, patch: Partial<{ fullName: string; phoneWa: string | null; passwordHash: string; kycStatus: KycStatus }>) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.fullName !== undefined) row.full_name = patch.fullName;
    if (patch.phoneWa !== undefined) row.phone_wa = patch.phoneWa;
    if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
    if (patch.kycStatus !== undefined) row.kyc_status = patch.kycStatus;
    const { error } = await this.db.from('users').update(row as never).eq('id', id);
    if (error) fail(error);
  }

  async getProfile(userId: string) {
    const { data, error } = await this.db.from('user_profiles_roles').select(PROFILE_COLUMNS).eq('user_id', userId).limit(1).maybeSingle();
    if (error) fail(error);
    return data ? toProfile(data) : null;
  }

  async createProfile(input: { userId: string; role: Role; businessName: string; cityRegion: string | null }) {
    const { data, error } = await this.db
      .from('user_profiles_roles')
      .insert({ user_id: input.userId, role_type: input.role, business_name: input.businessName, city_region: input.cityRegion })
      .select(PROFILE_COLUMNS)
      .single();
    if (error) fail(error, 'Akun ini sudah punya peran tetap.');
    return toProfile(data);
  }

  async updateProfile(userId: string, patch: Partial<{ businessName: string; cityRegion: string; bankAccount: BankAccount }>) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.businessName !== undefined) row.business_name = patch.businessName;
    if (patch.cityRegion !== undefined) row.city_region = patch.cityRegion;
    if (patch.bankAccount !== undefined) row.bank_account = patch.bankAccount;
    const { error } = await this.db.from('user_profiles_roles').update(row as never).eq('user_id', userId);
    if (error) fail(error);
  }

  async listProfiles(role?: Role): Promise<ProfileWithUser[]> {
    let query = this.db.from('user_profiles_roles').select(`${PROFILE_COLUMNS}, user:user_id (full_name, kyc_status)`);
    if (role) query = query.eq('role_type', role);
    const { data, error } = await query;
    if (error) fail(error);
    return (data ?? []).map((r: any) => ({ ...toProfile(r), fullName: r.user?.full_name ?? '', kycStatus: (r.user?.kyc_status ?? 'UNVERIFIED') as KycStatus }));
  }

  async getProfileWithUser(userId: string): Promise<ProfileWithUser | null> {
    const { data, error } = await this.db
      .from('user_profiles_roles')
      .select(`${PROFILE_COLUMNS}, user:user_id (full_name, kyc_status)`)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    if (error) fail(error);
    const r: any = data;
    return r ? { ...toProfile(r), fullName: r.user?.full_name ?? '', kycStatus: (r.user?.kyc_status ?? 'UNVERIFIED') as KycStatus } : null;
  }
}

export class SupabaseOtpRepository implements OtpRepository {
  constructor(private readonly db: Db) {}

  async create(input: { identifier: string; codeHash: string; expiresAt: Date }) {
    const { error } = await this.db
      .from('otp_codes')
      .insert({ identifier: input.identifier, otp_code: input.codeHash, expires_at: input.expiresAt.toISOString(), is_used: false });
    if (error) fail(error);
  }

  async countSince(identifier: string, since: Date) {
    const { count, error } = await this.db
      .from('otp_codes')
      .select('id', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('created_at', since.toISOString());
    if (error) fail(error);
    return count ?? 0;
  }

  async findActive(identifier: string, now: Date): Promise<OtpRecord | null> {
    const { data, error } = await this.db
      .from('otp_codes')
      .select('id, otp_code, attempts')
      .eq('identifier', identifier)
      .eq('is_used', false)
      .gt('expires_at', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) fail(error);
    const r: any = data;
    return r ? { id: r.id, codeHash: r.otp_code, attempts: Number(r.attempts ?? 0) } : null;
  }

  async incrementAttempts(id: string) {
    const { error } = await this.db.rpc('otp_increment_attempts' as never, { p_id: id } as never);
    if (error) fail(error);
  }

  async markUsed(id: string) {
    const { error } = await this.db.from('otp_codes').update({ is_used: true }).eq('id', id);
    if (error) fail(error);
  }
}
