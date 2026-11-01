import { randomBytes } from 'node:crypto';
import type { Env } from '../../shared/config/env';
import { badRequest, conflict, forbidden, notFound, serviceUnavailable } from '../../shared/errors';
import { logger } from '../../shared/logger';
import type { EventBus } from '../../shared/events/bus';
import type { AuthContext } from '../../shared/types';
import type { EventsApi } from '../events';
import type { IdentityApi } from '../identity';
import { depositAmount, payerOf, type ProposalsApi } from '../proposals';
import type { GatewayNotification, PaymentGateway, PaymentsRepository } from './ports';

const PAID_STATUSES = new Set(['settlement', 'capture']);

export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly gateway: PaymentGateway,
    private readonly proposals: ProposalsApi,
    private readonly events: EventsApi,
    private readonly identity: IdentityApi,
    private readonly env: Env,
    private readonly bus: EventBus
  ) {}

  /** What each of the user's held or settled escrows looks like, so the contract list can show the right action. */
  async escrows(userId: string) {
    const list = await this.repo.listForUser(userId);
    return list.map((t) => ({
      proposal_id: t.refId,
      state: t.state,
      amount: t.grossAmount,
      role: t.payerId === userId ? 'payer' : 'payee',
      bast_submitted_at: t.bastSubmittedAt,
      bast_approved_at: t.bastApprovedAt,
    }));
  }

  /** The recipient reports the work done. Nothing moves yet; the payer must approve. */
  async submitBast(auth: AuthContext, proposalId: string, note?: string) {
    const tx = await this.partyEscrow(auth, proposalId);
    if (auth.userId !== tx.payeeId) throw forbidden('Hanya pihak penerima dana yang bisa mengajukan BAST.');
    if (tx.state !== 'ESCROW_HELD') throw conflict('Dana pada kontrak ini sudah dilepas atau belum ditahan.');
    if (tx.bastSubmittedAt) throw conflict('BAST sudah diajukan.');
    if (!(await this.repo.submitBast(tx.id, note ?? null))) throw conflict('BAST sudah diajukan.');
    await this.bus.emit('payments.bast_submitted', { proposalId, payerId: tx.payerId, payeeId: tx.payeeId });
  }

  /** The payer accepts the handover; the money is released to the recipient's balance. */
  async approveBast(auth: AuthContext, proposalId: string) {
    const tx = await this.partyEscrow(auth, proposalId);
    if (auth.userId !== tx.payerId) throw forbidden('Hanya pihak pembayar yang bisa menyetujui BAST.');
    if (!tx.bastSubmittedAt) throw conflict('Penerima belum mengajukan BAST.');
    if (!(await this.repo.releaseEscrow(tx.id))) throw conflict('Dana pada kontrak ini sudah dilepas atau belum ditahan.');
    logger.info('escrow released', { proposal: proposalId, amount: tx.grossAmount });
    await this.bus.emit('payments.escrow_released', { proposalId, payerId: tx.payerId, payeeId: tx.payeeId, amount: tx.grossAmount - tx.platformFee });
  }

  /** Looks the escrow up and hides it from anyone who is not one of its two parties. */
  private async partyEscrow(auth: AuthContext, proposalId: string) {
    const tx = await this.repo.findByRef(proposalId);
    if (!tx || (tx.payerId !== auth.userId && tx.payeeId !== auth.userId)) throw notFound('Dana escrow untuk kontrak ini belum ada.');
    return tx;
  }

  async wallet(userId: string) {
    const w = await this.repo.getWallet(userId);
    return { escrow_locked: w?.escrowLocked ?? 0, available_bal: w?.availableBalance ?? 0, currency: w?.currency ?? 'IDR' };
  }

  /**
   * Starts a deposit payment for a signed contract. Nothing is marked as funded here: the contract
   * only becomes ESCROW_FUNDED once the gateway confirms the money arrived (see handleNotification).
   */
  async checkout(auth: AuthContext, proposalId: string) {
    if (!this.gateway.configured) throw serviceUnavailable('Pembayaran belum dikonfigurasi. Hubungi tim Event Yuk.');

    const proposal = await this.proposals.getForPayment(proposalId, auth.userId);
    if (!proposal) throw notFound('Kontrak tidak ditemukan.');
    if (proposal.status === 'ESCROW_FUNDED') throw conflict('DP kontrak ini sudah dibayar.');
    if (proposal.status !== 'CONTRACT_SIGNED' || proposal.dealPrice === null) throw conflict('Kontrak belum disepakati kedua pihak.');

    const event = await this.events.getSummary(proposal.eventId);
    if (!event) throw notFound('Acara kontrak ini tidak ditemukan.');
    const { payerId, payeeId } = payerOf(proposal, event.organizerId);
    if (auth.userId !== payerId) throw forbidden('Hanya pihak pembayar pada kontrak ini yang bisa membayar DP.');

    const recipient = await this.identity.getPublicProfile(payeeId);
    if (!recipient?.verified) throw forbidden('Penerima dana belum lolos verifikasi e-KYC, jadi DP belum bisa dibayarkan.');

    const amount = depositAmount(proposal.dealPrice, proposal.dpPercentage);
    if (amount < 1) throw badRequest('Nominal DP tidak valid.');
    const orderId = `EY-${proposal.id.slice(0, 8)}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
    const contact = await this.identity.getContact(payerId);
    if (!contact) throw notFound('Akun pembayar tidak ditemukan.');

    await this.repo.createTransaction({
      eventId: proposal.eventId,
      payerId,
      payeeId,
      refId: proposal.id,
      grossAmount: amount,
      platformFee: Math.round((amount * this.env.platformFeePct) / 100),
      orderId,
    });

    const checkout = await this.gateway.createCheckout({
      orderId,
      amount,
      itemName: `DP ${proposal.title}`,
      customer: { name: contact.fullName, email: contact.email },
      finishUrl: `${this.env.appBaseUrl}/contracts?order_id=${encodeURIComponent(orderId)}`,
    });

    return { order_id: orderId, amount, redirect_url: checkout.redirectUrl, token: checkout.token };
  }

  /**
   * Midtrans calls this when a payment changes state. Three independent checks protect it:
   * the signature, the amount against what we recorded, and the status fetched from Midtrans itself.
   * It is idempotent, so retries are safe.
   */
  async handleNotification(n: GatewayNotification): Promise<{ paid: boolean }> {
    if (!this.gateway.verifySignature(n)) {
      logger.warn('payment notification rejected: bad signature', { orderId: n.order_id });
      throw forbidden('Signature tidak valid.');
    }

    const tx = await this.repo.findByOrderId(n.order_id);
    if (!tx) throw notFound('Transaksi tidak dikenal.');
    if (Number(n.gross_amount) !== tx.grossAmount) {
      logger.error('payment notification rejected: amount mismatch', { orderId: n.order_id, expected: tx.grossAmount, received: n.gross_amount });
      throw badRequest('Nominal tidak sesuai dengan transaksi.');
    }

    const status = await this.gateway.getStatus(n.order_id);
    const paid = PAID_STATUSES.has(status.transactionStatus) && (status.fraudStatus === null || status.fraudStatus === 'accept');
    if (!paid) return { paid: false };

    const held = await this.repo.holdEscrow(tx.id);
    if (held) await this.bus.emit('payments.escrow_held', { proposalId: tx.refId, payerId: tx.payerId, payeeId: tx.payeeId, amount: tx.grossAmount });
    try {
      await this.proposals.markEscrowFunded(tx.refId);
    } catch (err) {
      // The money is safely held; the contract state can be repaired on the next retry or by hand.
      logger.error('escrow held but contract status not updated', { orderId: n.order_id, error: err instanceof Error ? err.message : String(err) });
    }
    return { paid: true };
  }

  ensureWallet(userId: string) {
    return this.repo.ensureWallet(userId);
  }
}
