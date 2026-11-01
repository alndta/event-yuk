import { createHash, timingSafeEqual } from 'node:crypto';
// midtrans-client ships no type declarations.
// @ts-ignore
import midtransClient from 'midtrans-client';
import type { Env } from '../../../shared/config/env';
import { badGateway } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import type { GatewayNotification, GatewayStatus, PaymentGateway } from '../ports';

export class MidtransGateway implements PaymentGateway {
  readonly configured: boolean;
  private readonly serverKey: string | undefined;
  private readonly snap: any;
  private readonly core: any;

  constructor(env: Env) {
    this.serverKey = env.midtrans.serverKey;
    this.configured = Boolean(env.midtrans.serverKey && env.midtrans.clientKey);
    if (this.configured) {
      const options = { isProduction: env.midtrans.isProduction, serverKey: env.midtrans.serverKey, clientKey: env.midtrans.clientKey };
      this.snap = new midtransClient.Snap(options);
      this.core = new midtransClient.CoreApi(options);
    }
  }

  async createCheckout(input: Parameters<PaymentGateway['createCheckout']>[0]) {
    try {
      const result = await this.snap.createTransaction({
        transaction_details: { order_id: input.orderId, gross_amount: input.amount },
        item_details: [{ id: input.orderId, price: input.amount, quantity: 1, name: input.itemName.slice(0, 50) }],
        customer_details: { first_name: input.customer.name.slice(0, 50), email: input.customer.email },
        callbacks: { finish: input.finishUrl },
      });
      return { token: String(result.token), redirectUrl: String(result.redirect_url) };
    } catch (err) {
      logger.error('midtrans checkout failed', { error: err instanceof Error ? err.message : String(err) });
      throw badGateway('Midtrans belum bisa membuat pembayaran. Coba lagi sebentar lagi.');
    }
  }

  async getStatus(orderId: string): Promise<GatewayStatus> {
    try {
      const r = await this.core.transaction.status(orderId);
      return { transactionStatus: String(r.transaction_status), fraudStatus: r.fraud_status ? String(r.fraud_status) : null };
    } catch (err) {
      logger.error('midtrans status lookup failed', { error: err instanceof Error ? err.message : String(err) });
      throw badGateway('Status pembayaran belum bisa diperiksa.');
    }
  }

  /** SHA512(order_id + status_code + gross_amount + ServerKey). Without a server key nothing verifies. */
  verifySignature(n: GatewayNotification): boolean {
    if (!this.serverKey) return false;
    const expected = createHash('sha512').update(`${n.order_id}${n.status_code}${n.gross_amount}${this.serverKey}`).digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(n.signature_key, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
