import { AppError, conflict } from '../../../shared/errors';
import type { Db } from '../../../shared/db/supabase';
import type { DocumentStore, KycDocument, KycDocumentKind, KycRepository, KycSubmission } from '../ports';

const toSubmission = (r: any): KycSubmission => ({
  id: r.id,
  userId: r.user_id,
  status: r.status,
  rejectReason: r.reject_reason ?? null,
  createdAt: r.created_at,
  reviewedAt: r.reviewed_at ?? null,
});

const fail = (): never => {
  throw new AppError(500, 'DATABASE_ERROR', 'Terjadi kesalahan pada penyimpanan data.', undefined);
};

export class SupabaseKycRepository implements KycRepository {
  // The generated types predate this table, so it is addressed loosely.
  private get table() {
    return (this.db as any).from('kyc_submissions');
  }
  constructor(private readonly db: Db) {}

  async create(input: { userId: string; nikHash: string }) {
    const { data, error } = await this.table.insert({ user_id: input.userId, nik_hash: input.nikHash, status: 'PENDING' }).select().single();
    if (error) {
      if (error.code === '23505') throw conflict('Data identitas ini sudah dipakai atau sedang diproses di akun lain.');
      return fail();
    }
    return toSubmission(data);
  }

  async latestFor(userId: string) {
    const { data, error } = await this.table.select().eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) return fail();
    return data ? toSubmission(data) : null;
  }

  async listPending() {
    const { data, error } = await this.table
      .select('*, user:user_id (full_name, email)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) return fail();
    return (data ?? []).map((r: any) => ({ ...toSubmission(r), fullName: r.user?.full_name ?? '', email: r.user?.email ?? '' }));
  }

  async decide(input: { userId: string; status: 'APPROVED' | 'REJECTED'; reviewerId: string; reason: string | null }) {
    const { error } = await this.table
      .update({ status: input.status, reviewed_by: input.reviewerId, reviewed_at: new Date().toISOString(), reject_reason: input.reason })
      .eq('user_id', input.userId)
      .eq('status', 'PENDING');
    if (error) fail();
  }

  async addDocument(input: { userId: string; kind: KycDocumentKind; path: string; contentType: string; size: number }) {
    const { error } = await (this.db as any)
      .from('kyc_documents')
      .insert({ user_id: input.userId, kind: input.kind, path: input.path, content_type: input.contentType, size_bytes: input.size });
    if (error) fail();
  }

  async listDocuments(userId: string): Promise<KycDocument[]> {
    const { data, error } = await (this.db as any).from('kyc_documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return fail();
    const latest = new Map<string, KycDocument>();
    for (const r of data ?? []) {
      if (!latest.has(r.kind)) {
        latest.set(r.kind, { id: r.id, userId: r.user_id, kind: r.kind, path: r.path, contentType: r.content_type, size: r.size_bytes, createdAt: r.created_at });
      }
    }
    return [...latest.values()];
  }
}

const BUCKET = 'kyc-documents';

/** Private Supabase Storage bucket; nothing in it is ever public. */
export class SupabaseDocumentStore implements DocumentStore {
  constructor(private readonly db: Db) {}

  async put(path: string, body: Buffer, contentType: string) {
    const { error } = await this.db.storage.from(BUCKET).upload(path, body, { contentType, upsert: false });
    if (error) fail();
  }

  async signedUrl(path: string, expiresInSeconds: number) {
    const { data, error } = await this.db.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
    if (error || !data) return fail();
    return data.signedUrl;
  }
}
