import express, { Router, type RequestHandler } from 'express';
import { langOf } from '../../shared/i18n/messages';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { currentAuth, type AuthGuards } from '../../shared/http/auth';
import { validate } from '../../shared/http/validate';
import {
  adminKycSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  kycDocumentQuery,
  googleSyncSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  setRoleSchema,
  submitKycSchema,
  updateProfileSchema,
  userIdParams,
} from './schemas';
import type { IdentityService } from './service';

export interface IdentityLimiters {
  auth: RequestHandler[];
  otp: RequestHandler[];
  login: RequestHandler[];
}

export function createIdentityRouter(service: IdentityService, guards: AuthGuards, limits: IdentityLimiters, exposePreview: boolean) {
  const router = Router();

  router.post(
    '/auth/send-otp',
    ...limits.auth,
    ...limits.otp,
    validate({ body: requestOtpSchema }),
    asyncHandler(async (req, res) => {
      const email = (req.body.email ?? req.body.identifier) as string;
      const { preview } = await service.requestOtp(email, langOf(req));
      res.json({
        success: true,
        message: 'Kode verifikasi dikirim ke email kamu.',
        ...(exposePreview && preview ? { otp_preview: preview } : {}),
      });
    })
  );

  router.post(
    '/auth/verify-otp-register',
    ...limits.auth,
    validate({ body: registerSchema }),
    asyncHandler(async (req, res) => {
      const session = await service.register(req.body);
      res.status(201).json({ success: true, message: 'Pendaftaran berhasil.', ...session });
    })
  );

  router.post(
    '/auth/forgot-password',
    ...limits.auth,
    ...limits.otp,
    validate({ body: forgotPasswordSchema }),
    asyncHandler(async (req, res) => {
      const { preview } = await service.requestPasswordReset(req.body.email, langOf(req));
      res.json({
        success: true,
        message: 'Kalau email itu terdaftar, kode atur ulang sudah dikirim.',
        ...(exposePreview && preview ? { otp_preview: preview } : {}),
      });
    })
  );

  router.post(
    '/auth/reset-password',
    ...limits.auth,
    ...limits.login,
    validate({ body: resetPasswordSchema }),
    asyncHandler(async (req, res) => {
      await service.resetPassword(req.body.email, req.body.otp_code, req.body.new_password);
      res.json({ success: true, message: 'Kata sandi diperbarui. Silakan masuk.' });
    })
  );

  router.post(
    '/auth/login',
    ...limits.auth,
    ...limits.login,
    validate({ body: loginSchema }),
    asyncHandler(async (req, res) => {
      const session = await service.login(req.body.email, req.body.password);
      res.json({ success: true, message: 'Login berhasil.', ...session });
    })
  );

  router.post(
    '/auth/google-sync',
    ...limits.auth,
    validate({ body: googleSyncSchema }),
    asyncHandler(async (req, res) => {
      const session = await service.googleSync(req.body.access_token);
      res.json({ success: true, ...session });
    })
  );

  router.get(
    '/users/me',
    guards.requireAuth,
    asyncHandler(async (req, res) => {
      res.json({ success: true, user: await service.me(currentAuth(req).userId) });
    })
  );

  router.patch(
    '/users/profile',
    guards.requireAuth,
    validate({ body: updateProfileSchema }),
    asyncHandler(async (req, res) => {
      const user = await service.updateProfile(currentAuth(req).userId, req.body);
      res.json({ success: true, message: 'Profil diperbarui.', user });
    })
  );

  router.get(
    '/users/kyc',
    guards.requireAuth,
    asyncHandler(async (req, res) => {
      res.json({ success: true, kyc: await service.myKyc(currentAuth(req).userId) });
    })
  );

  router.get(
    '/admin/kyc/pending',
    guards.requireAuth,
    guards.requireAdmin,
    asyncHandler(async (_req, res) => {
      res.json({ success: true, data: await service.pendingKyc() });
    })
  );

  // Photos arrive as the raw image body (not JSON) so the 100 KB JSON limit does not apply.
  router.post(
    '/users/kyc/documents',
    guards.requireAuth,
    ...limits.auth,
    express.raw({ type: ['image/jpeg', 'image/png'], limit: '5mb' }),
    validate({ query: kycDocumentQuery }),
    asyncHandler(async (req, res) => {
      await service.uploadKycDocument(currentAuth(req).userId, (req.query as { kind: 'KTP' | 'SELFIE' }).kind, req.body as Buffer);
      res.status(201).json({ success: true, message: 'Foto tersimpan.' });
    })
  );

  router.get(
    '/admin/kyc/:id/documents',
    guards.requireAuth,
    guards.requireAdmin,
    validate({ params: userIdParams }),
    asyncHandler(async (req, res) => {
      res.json({ success: true, data: await service.kycDocumentLinks(currentAuth(req).userId, req.params.id as string) });
    })
  );

  router.post(
    '/users/kyc',
    guards.requireAuth,
    validate({ body: submitKycSchema }),
    asyncHandler(async (req, res) => {
      const user = await service.submitKyc(currentAuth(req).userId, req.body.nik, req.body.bank_account);
      res.json({ success: true, message: 'Pengajuan e-KYC terkirim dan menunggu verifikasi.', user });
    })
  );

  router.post(
    '/users/roles/set-role',
    guards.requireAuth,
    validate({ body: setRoleSchema }),
    asyncHandler(async (req, res) => {
      const user = await service.setRole(currentAuth(req).userId, req.body);
      res.status(201).json({ success: true, message: `Peran ${user.active_role} aktif untuk akunmu.`, activeRole: user.active_role, user });
    })
  );

  router.post(
    '/admin/users/:id/kyc',
    guards.requireAuth,
    guards.requireAdmin,
    validate({ params: userIdParams, body: adminKycSchema }),
    asyncHandler(async (req, res) => {
      await service.decideKyc(currentAuth(req).userId, req.params.id as string, req.body.decision, req.body.reason);
      res.json({ success: true, message: 'Status e-KYC diperbarui.' });
    })
  );

  return router;
}
