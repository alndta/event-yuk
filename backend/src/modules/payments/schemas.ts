import { z } from 'zod';

export const checkoutParams = z.object({ id: z.uuid() });

// Midtrans sends more fields than these; only what we verify against is declared.
export const notificationSchema = z.object({
  order_id: z.string().min(1).max(100),
  status_code: z.string().min(1).max(10),
  gross_amount: z.string().min(1).max(30),
  signature_key: z.string().min(1).max(256),
});
