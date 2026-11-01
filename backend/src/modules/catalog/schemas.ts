import { z } from 'zod';

const specs = z.union([z.array(z.string().trim().min(1).max(300)).max(40), z.record(z.string().max(80), z.string().max(300))]);
const price = z.coerce.number().int().min(0).max(100_000_000_000);

export const listPartnersQuery = z.object({ type: z.enum(['VENDOR', 'TALENT', 'SPONSOR', 'EO', 'TENANT', 'CREW']).optional(),
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
});
export const partnerParams = z.object({ id: z.uuid() });
export const itemParams = z.object({ id: z.uuid() });

const category = z.enum(['SOUND', 'STAGE', 'LIGHTING', 'TENT']);

export const vendorItemSchema = z.object({
  package_name: z.string().trim().min(2).max(255),
  category: category,
  base_price: price,
  daily_quota: z.coerce.number().int().min(0).max(1000).default(1),
  tech_specs: specs.default([]),
});

export const talentItemSchema = z.object({
  stage_name: z.string().trim().min(2).max(255),
  genre: z.string().trim().min(2).max(100).optional(),
  base_price: price,
  tech_specs: specs.default([]),
  hospitality_riders: specs.default([]),
});

export type VendorItemInput = z.infer<typeof vendorItemSchema>;
export type TalentItemInput = z.infer<typeof talentItemSchema>;
