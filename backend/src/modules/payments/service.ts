import { randomBytes } from 'node:crypto';
import type { Env } from '../../shared/config/env';
import { badRequest, conflict, forbidden, notFound, serviceUnavailable } from '../../shared/errors';
import { logger } from '../../shared/logger';
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
    private readonly env: Env
  ) {}

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

    await this.repo.holdEscrow(tx.id);
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
