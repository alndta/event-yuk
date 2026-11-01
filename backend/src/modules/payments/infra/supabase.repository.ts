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
});

export class SupabasePaymentsRepository implements PaymentsRepository {
  constructor(private readonly db: Db) {}

  async createTransaction(input: Omit<EscrowTransaction, 'id' | 'state'>) {
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
