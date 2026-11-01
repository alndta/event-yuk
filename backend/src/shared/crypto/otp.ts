import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/** A uniformly random six-digit code from the OS random source. */
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** Codes are stored as an HMAC bound to the email, so a database leak does not reveal live codes. */
export function hashOtp(identifier: string, code: string, secret: string): string {
  return createHmac('sha256', secret).update(`${identifier.toLowerCase()}:${code}`).digest('hex');
}

export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && ba.length > 0 && timingSafeEqual(ba, bb);
}

/** Derive a purpose-specific key from the master secret. */
export function deriveKey(secret: string, purpose: string): string {
  return createHmac('sha256', secret).update(purpose).digest('hex');
}
