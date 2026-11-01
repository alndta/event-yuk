import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { currentAuth, type AuthGuards } from '../../shared/http/auth';
import { noStore } from '../../shared/http/security';
import { validate } from '../../shared/http/validate';
import { bastSchema, checkoutParams, notificationSchema } from './schemas';
import type { PaymentsService } from './service';

export function createPaymentsRouter(service: PaymentsService, guards: AuthGuards, limits: RequestHandler[]) {
  const router = Router();

  router.get(
    '/wallet',
    noStore,
    guards.requireAuth,
    asyncHandler(async (req, res) => {
      res.json({ success: true, wallet: await service.wallet(currentAuth(req).userId) });
    })
  );

  router.get(
    '/escrows',
    noStore,
    guards.requireAuth,
    asyncHandler(async (req, res) => {
      res.json({ success: true, data: await service.escrows(currentAuth(req).userId) });
    })
  );

  router.post(
    '/proposals/:id/bast',
    noStore,
    guards.requireAuth,
    ...limits,
    validate({ params: checkoutParams, body: bastSchema }),
    asyncHandler(async (req, res) => {
      await service.submitBast(currentAuth(req), req.params.id as string, req.body.note);
      res.json({ success: true, message: 'BAST diajukan. Menunggu persetujuan pembayar.' });
    })
  );

  router.post(
    '/proposals/:id/bast/approve',
    noStore,
    guards.requireAuth,
    ...limits,
    validate({ params: checkoutParams }),
    asyncHandler(async (req, res) => {
      await service.approveBast(currentAuth(req), req.params.id as string);
      res.json({ success: true, message: 'BAST disetujui. Dana dilepas ke penerima.' });
    })
  );

  router.post(
    '/proposals/:id/checkout',
    noStore,
    guards.requireAuth,
    ...limits,
    validate({ params: checkoutParams }),
    asyncHandler(async (req, res) => {
      const data = await service.checkout(currentAuth(req), req.params.id as string);
      res.status(201).json({ success: true, message: 'Lanjutkan pembayaran DP di halaman Midtrans.', ...data });
    })
  );

  // Called by Midtrans, not by browsers: no session, protected by the signature instead.
  router.post(
    '/midtrans/notification',
    noStore,
    validate({ body: notificationSchema }),
    asyncHandler(async (req, res) => {
      const { paid } = await service.handleNotification(req.body);
      res.json({ success: true, paid });
    })
  );

  return router;
}
