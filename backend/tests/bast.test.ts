import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/shared/config/env';
import { EventBus } from '../src/shared/events/bus';
import type { EscrowTransaction, PaymentsRepository, Wallet } from '../src/modules/payments/ports';
import { PaymentsService } from '../src/modules/payments/service';

/** Mirrors what the SQL functions do, so the rules around them can be tested without a database. */
class MemoryPayments implements PaymentsRepository {
  txs: EscrowTransaction[] = [];
  wallets = new Map<string, Wallet>();
  private wallet(id: string) {
    if (!this.wallets.has(id)) this.wallets.set(id, { escrowLocked: 0, availableBalance: 0, currency: 'IDR' });
    return this.wallets.get(id)!;
  }
  async createTransaction(i: Omit<EscrowTransaction, 'id' | 'state' | 'bastSubmittedAt' | 'bastApprovedAt'>) {
    const t: EscrowTransaction = { ...i, id: randomUUID(), state: 'INITIATED', bastSubmittedAt: null, bastApprovedAt: null };
    this.txs.push(t);
    return t;
  }
  async findByOrderId(o: string) { return this.txs.find((t) => t.orderId === o) ?? null; }
  async holdEscrow(id: string) {
    const t = this.txs.find((x) => x.id === id);
    if (!t || t.state !== 'INITIATED') return false;
    t.state = 'ESCROW_HELD';
    this.wallet(t.payerId).escrowLocked += t.grossAmount;
    return true;
  }
  async findByRef(ref: string) { return [...this.txs].reverse().find((t) => t.refId === ref) ?? null; }
  async listForUser(u: string) { return this.txs.filter((t) => (t.payerId === u || t.payeeId === u) && (t.state === 'ESCROW_HELD' || t.state === 'SETTLED')); }
  async submitBast(id: string) {
    const t = this.txs.find((x) => x.id === id);
    if (!t || t.state !== 'ESCROW_HELD' || t.bastSubmittedAt) return false;
    t.bastSubmittedAt = new Date().toISOString();
    return true;
  }
  async releaseEscrow(id: string) {
    const t = this.txs.find((x) => x.id === id);
    if (!t || t.state !== 'ESCROW_HELD' || !t.bastSubmittedAt) return false;
    t.state = 'SETTLED';
    t.bastApprovedAt = new Date().toISOString();
    this.wallet(t.payerId).escrowLocked -= t.grossAmount;
    this.wallet(t.payeeId).availableBalance += t.grossAmount - t.platformFee;
    return true;
  }
  async getWallet(u: string) { return this.wallets.get(u) ?? null; }
  async ensureWallet(u: string) { this.wallet(u); }
}

const setup = async () => {
  const repo = new MemoryPayments();
  const bus = new EventBus();
  const seen: string[] = [];
  bus.on('payments.bast_submitted', () => { seen.push('submitted'); });
  bus.on('payments.escrow_released', () => { seen.push('released'); });
  const service = new PaymentsService(repo, {} as never, {} as never, {} as never, {} as never, loadEnv({ NODE_ENV: 'test', JWT_SECRET: 'x'.repeat(40) } as never), bus);
  const tx = await repo.createTransaction({ eventId: 'e', payerId: 'payer', payeeId: 'payee', refId: 'proposal-1', grossAmount: 10_000_000, platformFee: 250_000, orderId: 'EY-1' });
  await repo.holdEscrow(tx.id);
  const as = (userId: string) => ({ userId, role: 'VENDOR' as const, email: `${userId}@x.id` });
  return { repo, service, as, seen };
};

describe('handover (BAST) and escrow release', () => {
  it('releases the money only after the recipient reports and the payer approves', async () => {
    const { repo, service, as, seen } = await setup();
    await expect(service.approveBast(as('payer'), 'proposal-1')).rejects.toThrow(/belum mengajukan/);
    await service.submitBast(as('payee'), 'proposal-1', 'Alat sudah dibongkar');
    expect(repo.wallets.get('payer')!.escrowLocked).toBe(10_000_000); // nothing moved yet
    await service.approveBast(as('payer'), 'proposal-1');
    expect(repo.wallets.get('payer')!.escrowLocked).toBe(0);
    expect(repo.wallets.get('payee')!.availableBalance).toBe(9_750_000); // minus the platform fee
    expect(seen).toEqual(['submitted', 'released']);
  });

  it('keeps each step to the right party', async () => {
    const { service, as } = await setup();
    await expect(service.submitBast(as('payer'), 'proposal-1')).rejects.toThrow(/penerima/);
    await service.submitBast(as('payee'), 'proposal-1');
    await expect(service.approveBast(as('payee'), 'proposal-1')).rejects.toThrow(/pembayar/);
  });

  it('hides the escrow from strangers', async () => {
    const { service, as } = await setup();
    await expect(service.submitBast(as('stranger'), 'proposal-1')).rejects.toThrow(/belum ada/);
    await expect(service.approveBast(as('stranger'), 'proposal-1')).rejects.toThrow(/belum ada/);
  });

  it('cannot release the same escrow twice', async () => {
    const { repo, service, as } = await setup();
    await service.submitBast(as('payee'), 'proposal-1');
    await service.approveBast(as('payer'), 'proposal-1');
    await expect(service.approveBast(as('payer'), 'proposal-1')).rejects.toThrow(/sudah dilepas/);
    await expect(service.submitBast(as('payee'), 'proposal-1')).rejects.toThrow(/sudah dilepas/);
    expect(repo.wallets.get('payee')!.availableBalance).toBe(9_750_000);
  });

  it('lists the escrows with the role of the asker', async () => {
    const { service } = await setup();
    const mine = await service.escrows('payee');
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ proposal_id: 'proposal-1', role: 'payee', state: 'ESCROW_HELD' });
  });
});
