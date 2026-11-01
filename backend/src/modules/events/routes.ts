import { Router } from 'express';
import type { ResponseCache } from '../../shared/cache/memoryCache';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { currentAuth, type AuthGuards } from '../../shared/http/auth';
import { validate } from '../../shared/http/validate';
import {
  boothParams,
  createEventSchema,
  createPortfolioSchema,
  eventParams,
  listEventsQuery,
  registerBoothSchema,
  shiftParams,
} from './schemas';
import type { EventsService } from './service';

export function createEventsRouter(service: EventsService, guards: AuthGuards, cache: ResponseCache) {
  const router = Router();
  const CACHE_PREFIX = '/api/v1/events';

  router.get(
    '/',
    cache.middleware(30),
    validate({ query: listEventsQuery }),
    asyncHandler(async (req, res) => {
      const data = await service.list(req.query as { type?: 'portfolio' | 'live'; category?: never });
      res.json({ success: true, count: data.length, data });
    })
  );

  router.get(
    '/:id',
    cache.middleware(30),
    validate({ params: eventParams }),
    asyncHandler(async (req, res) => {
      res.json({ success: true, data: await service.get(req.params.id as string) });
    })
  );

  router.post(
    '/',
    guards.requireAuth,
    guards.requireRole('EO'),
    validate({ body: createEventSchema }),
    asyncHandler(async (req, res) => {
      const data = await service.create(currentAuth(req).userId, req.body);
      cache.invalidate(CACHE_PREFIX);
      res.status(201).json({ success: true, message: 'Proyek acara dibuat.', data });
    })
  );

  router.post(
    '/portfolio',
    guards.requireAuth,
    guards.requireRole('EO'),
    validate({ body: createPortfolioSchema }),
    asyncHandler(async (req, res) => {
      const data = await service.createPortfolio(currentAuth(req).userId, req.body);
      cache.invalidate(CACHE_PREFIX);
      res.status(201).json({ success: true, message: 'Portofolio diunggah.', data });
    })
  );

  router.post(
    '/:id/booths/:boothId/register',
    guards.requireAuth,
    guards.requireRole('TENANT'),
    validate({ params: boothParams, body: registerBoothSchema }),
    asyncHandler(async (req, res) => {
      const data = await service.registerBooth(currentAuth(req).userId, req.params.id as string, req.params.boothId as string, req.body);
      cache.invalidate(CACHE_PREFIX);
      res.status(201).json({ success: true, message: 'Pendaftaran booth dikirim untuk dikurasi penyelenggara.', data });
    })
  );

  router.post(
    '/:id/shifts/:shiftId/apply',
    guards.requireAuth,
    guards.requireRole('CREW'),
    validate({ params: shiftParams }),
    asyncHandler(async (req, res) => {
      const data = await service.applyToShift(currentAuth(req).userId, req.params.id as string, req.params.shiftId as string);
      res.status(201).json({ success: true, message: 'Lamaran shift dikirim.', data });
    })
  );

  return router;
}
