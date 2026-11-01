import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { currentAuth, type AuthGuards } from '../../shared/http/auth';
import { noStore } from '../../shared/http/security';
import { validate } from '../../shared/http/validate';
import { counterSchema, createProposalSchema, listProposalsQuery, proposalParams, respondSchema } from './schemas';
import type { ProposalsService } from './service';

export function createProposalsRouter(service: ProposalsService, guards: AuthGuards, limits: import('express').RequestHandler[]) {
  const router = Router();
  router.use(noStore, guards.requireAuth);

  router.get(
    '/',
    validate({ query: listProposalsQuery }),
    asyncHandler(async (req, res) => {
      const data = await service.list(currentAuth(req), req.query as never);
      res.json({ success: true, count: data.length, data });
    })
  );

  router.post(
    '/',
    ...limits,
    validate({ body: createProposalSchema }),
    asyncHandler(async (req, res) => {
      const data = await service.create(currentAuth(req), req.body);
      res.status(201).json({ success: true, message: 'Pengajuan terkirim.', data });
    })
  );

  router.post(
    '/:id/counter',
    validate({ params: proposalParams, body: counterSchema }),
    asyncHandler(async (req, res) => {
      const data = await service.counter(currentAuth(req), req.params.id as string, req.body);
      res.json({ success: true, message: 'Perubahan penawaran diajukan.', data });
    })
  );

  router.post(
    '/:id/respond',
    validate({ params: proposalParams, body: respondSchema }),
    asyncHandler(async (req, res) => {
      const data = await service.respond(currentAuth(req), req.params.id as string, req.body.action);
      res.json({
        success: true,
        message: req.body.action === 'ACCEPT' ? 'Pengajuan disetujui. Dokumen PKS digital diterbitkan.' : 'Pengajuan ditolak.',
        data,
      });
    })
  );

  return router;
}
