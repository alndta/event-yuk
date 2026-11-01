import { Router } from 'express';
import type { ResponseCache } from '../../shared/cache/memoryCache';
import { badRequest } from '../../shared/errors';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { currentAuth, type AuthGuards } from '../../shared/http/auth';
import { validate } from '../../shared/http/validate';
import { itemParams, listPartnersQuery, partnerParams, talentItemSchema, vendorItemSchema } from './schemas';
import type { CatalogService } from './service';

export function createCatalogRouter(service: CatalogService, guards: AuthGuards, cache: ResponseCache) {
  const router = Router();

  router.get(
    '/partners',
    cache.middleware(60),
    validate({ query: listPartnersQuery }),
    asyncHandler(async (req, res) => {
      const data = await service.listPartners((req.query as { type?: never }).type);
      res.json({ success: true, count: data.length, data });
    })
  );

  router.get(
    '/partners/:id',
    guards.optionalAuth,
    validate({ params: partnerParams }),
    asyncHandler(async (req, res) => {
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, data: await service.getPartner(req.params.id as string, req.auth) });
    })
  );

  router.get(
    '/catalog/my-catalog',
    guards.requireAuth,
    asyncHandler(async (req, res) => {
      res.json({ success: true, ...(await service.myCatalog(currentAuth(req))) });
    })
  );

  router.post(
    '/catalog/item',
    guards.requireAuth,
    asyncHandler(async (req, res, next) => {
      const auth = currentAuth(req);
      if (auth.role === 'VENDOR') {
        const parsed = vendorItemSchema.parse(req.body);
        const item = await service.addVendorPackage(auth, parsed);
        cache.invalidate('/api/v1/partners');
        return res.status(201).json({ success: true, message: 'Paket ditambahkan ke katalog.', item });
      }
      if (auth.role === 'TALENT') {
        const parsed = talentItemSchema.parse(req.body);
        const item = await service.saveTalent(auth, parsed);
        cache.invalidate('/api/v1/partners');
        return res.status(201).json({ success: true, message: 'Katalog penampilan diperbarui.', item });
      }
      return next(badRequest('Peran kamu tidak punya katalog yang bisa diisi.'));
    })
  );

  router.delete(
    '/catalog/item/:id',
    guards.requireAuth,
    validate({ params: itemParams }),
    asyncHandler(async (req, res) => {
      await service.deletePackage(currentAuth(req), req.params.id as string);
      cache.invalidate('/api/v1/partners');
      res.json({ success: true, message: 'Paket dihapus dari katalog.' });
    })
  );

  return router;
}
