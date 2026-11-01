import * as crypto from 'crypto';
// @ts-ignore
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const serverKey = process.env.MIDTRANS_SERVER_KEY ;
const clientKey = process.env.MIDTRANS_CLIENT_KEY ;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Midtrans Snap client (for checkout popup / redirect)
export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

// Midtrans CoreAPI client (for direct check status, refund, etc.)
export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

/**
 * Verifies Midtrans Webhook SHA512 signature:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const calculatedSignature = crypto.createHash('sha512').update(payload).digest('hex');
  return calculatedSignature === signatureKey;
}
