import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal memakai format YYYY-MM-DD.');
const assetUrl = z
  .string()
  .max(500)
  .refine((v) => v.startsWith('/') || /^https:\/\//.test(v), 'Gunakan alamat https:// atau path yang dimulai dengan /.');
const category = z.enum(['CONCERT', 'PENSI', 'EXPO', 'BAZAAR']);
const rupiah = z.coerce.number().int().min(0).max(100_000_000_000);

export const createEventSchema = z
  .object({
    title: z.string().trim().min(3).max(255),
    event_category: category,
    venue_name: z.string().trim().min(2).max(255),
    gps_lat_lng: z.string().trim().max(100).optional(),
    start_date: isoDate,
    end_date: isoDate,
    total_budget: rupiah.default(0),
    description: z.string().trim().max(4000).default(''),
    banner_image: assetUrl.optional(),
    allow_vendor_proposals: z.boolean().optional(),
    allow_talent_proposals: z.boolean().optional(),
    allow_tenant_registrations: z.boolean().optional(),
    allow_crew_applications: z.boolean().optional(),
    is_invite_only: z.boolean().optional(),
  })
  .refine((v) => v.end_date >= v.start_date, { message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.', path: ['end_date'] });

export const createPortfolioSchema = z
  .object({
    title: z.string().trim().min(3).max(255),
    event_category: category,
    venue_name: z.string().trim().min(2).max(255),
    start_date: isoDate,
    end_date: isoDate.optional(),
    attendee_count: z.coerce.number().int().min(0).max(10_000_000).default(0),
    total_budget: rupiah.default(0),
    description: z.string().trim().max(4000).default(''),
    banner_image: assetUrl.optional(),
    gallery_photos: z.array(assetUrl).max(20).default([]),
    aftermovie_url: z.string().url().max(500).startsWith('https://').optional(),
  })
  .refine((v) => !v.end_date || v.end_date >= v.start_date, { message: 'Tanggal selesai tidak boleh sebelum tanggal mulai.', path: ['end_date'] });

export const listEventsQuery = z.object({
  type: z.enum(['portfolio', 'live']).optional(),
  category: category.optional(),
  q: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
});

export const eventParams = z.object({ id: z.uuid() });
export const boothParams = z.object({ id: z.uuid(), boothId: z.uuid() });
export const shiftParams = z.object({ id: z.uuid(), shiftId: z.uuid() });

export const registerBoothSchema = z.object({
  brand_name: z.string().trim().min(2).max(255),
  product_photos: z.array(assetUrl).max(10).default([]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
