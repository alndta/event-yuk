import { AppError } from '../../../shared/errors';
import type { Db } from '../../../shared/db/supabase';
import type { EscrowTransaction, PaymentsRepository, Wallet } from '../ports';

function fail(_error: { message: string }): never {
  throw new AppError(500, 'DATABASE_ERROR', 'Terjadi kesalahan pada penyimpanan data.');
}

const toTx = (r: any): EscrowTransaction => ({
  id: r.id,
  eventId: r.event_id,
  payerId: r.payer_id,
  payeeId: r.payee_id,
  refId: r.ref_id,
  grossAmount: Number(r.gross_amount),
  platformFee: Number(r.platform_fee),
  state: r.escrow_state,
  orderId: r.idempotency_key,
  bastSubmittedAt: r.bast_submitted_at ?? null,
  bastApprovedAt: r.bast_approved_at ?? null,
});

export class SupabasePaymentsRepository implements PaymentsRepository {
  constructor(private readonly db: Db) {}

  async createTransaction(input: Omit<EscrowTransaction, 'id' | 'state' | 'bastSubmittedAt' | 'bastApprovedAt'>) {
    const { data, error } = await this.db
      .from('escrow_transactions')
      .insert({
        event_id: input.eventId,
        payer_id: input.payerId,
        payee_id: input.payeeId,
        ref_type: 'VENDOR_ORDER',
        ref_id: input.refId,
        gross_amount: input.grossAmount,
        platform_fee: input.platformFee,
        escrow_state: 'INITIATED',
        idempotency_key: input.orderId,
      })
      .select('*')
      .single();
    if (error) fail(error);
    return toTx(data);
  }

  async findByOrderId(orderId: string) {
    const { data, error } = await this.db.from('escrow_transactions').select('*').eq('idempotency_key', orderId).maybeSingle();
    if (error) fail(error);
    return data ? toTx(data) : null;
  }

  async holdEscrow(transactionId: string) {
    const { data, error } = await this.db.rpc('hold_escrow' as never, { p_tx_id: transactionId } as never);
    if (error) fail(error);
    return data === true;
  }

  async findByRef(refId: string) {
    const { data, error } = await this.db.from('escrow_transactions').select('*').eq('ref_id', refId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) fail(error);
    return data ? toTx(data) : null;
  }

  async listForUser(userId: string) {
    const { data, error } = await this.db
      .from('escrow_transactions')
      .select('*')
      .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
      .in('escrow_state', ['ESCROW_HELD', 'SETTLED'])
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) fail(error);
    return (data ?? []).map(toTx);
  }

  async submitBast(transactionId: string, note: string | null) {
    const { data, error } = await this.db.rpc('submit_bast' as never, { p_tx_id: transactionId, p_note: note } as never);
    if (error) fail(error);
    return data === true;
  }

  async releaseEscrow(transactionId: string) {
    const { data, error } = await this.db.rpc('release_escrow' as never, { p_tx_id: transactionId } as never);
    if (error) fail(error);
    return data === true;
  }

  async getWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await this.db.from('wallets').select('escrow_locked, available_bal, currency').eq('user_id', userId).maybeSingle();
    if (error) fail(error);
    const r: any = data;
    return r ? { escrowLocked: Number(r.escrow_locked ?? 0), availableBalance: Number(r.available_bal ?? 0), currency: r.currency ?? 'IDR' } : null;
  }

  async ensureWallet(userId: string) {
    const { error } = await this.db.from('wallets').upsert({ user_id: userId } as never, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) fail(error);
  }
}
