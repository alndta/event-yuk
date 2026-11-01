import { Router, Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { cacheResponse, invalidateCache } from '../../middleware/cache';

const router = Router();

/**
 * GET /api/v1/events
 * Query params:
 * - type: 'live' | 'portfolio' | 'all'
 * - category: 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR'
 */
router.get('/', cacheResponse(30), async (req: Request, res: Response) => {
  try {
    const { type, category } = req.query;
    let query = supabase.from('events').select(`
      *,
      organizer:organizer_id (
        id,
        full_name,
        email,
        kyc_status
      ),
      tenant_booths (id, booth_code, rental_price, is_occupied),
      crew_shifts (id, role_title, headcount_req, rate_per_shift),
      vendor_bookings (id, agreed_price, booking_status)
    `);

    if (type === 'portfolio') {
      query = query.eq('is_portfolio', true);
    } else if (type === 'live') {
      query = query.eq('is_portfolio', false);
    }

    if (category) {
      query = query.eq('event_category', category as string);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      count: data?.length || 0,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/events/:id
 * Retrieve single event details with full relations
 */
router.get('/:id', cacheResponse(30), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:organizer_id (
          id,
          full_name,
          email,
          phone_wa,
          kyc_status
        ),
        tenant_booths (*),
        crew_shifts (*),
        vendor_bookings (*),
        sponsorship_packages (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!event) {
      return res.status(404).json({ success: false, error: 'Acara tidak ditemukan.' });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/events/:id/booths/:boothId/register
 * Tenant registers for a booth in this event
 */
router.post('/:id/booths/:boothId/register', async (req: Request, res: Response) => {
  try {
    const { boothId } = req.params;
    const { tenant_user_id, brand_name, product_photos } = req.body;

    if (!tenant_user_id || !brand_name) {
      return res.status(400).json({
        success: false,
        error: 'tenant_user_id dan brand_name wajib diisi.',
      });
    }

    const { data, error } = await supabase
      .from('tenant_registrations')
      .insert({
        booth_id: boothId,
        tenant_user_id,
        brand_name,
        product_photos: product_photos || [],
        curation_status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran booth berhasil diajukan untuk kurasi pihak EO!',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/events/:id/shifts/:shiftId/apply
 * Crew applies for a shift in this event
 */
router.post('/:id/shifts/:shiftId/apply', async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const { crew_user_id } = req.body;

    if (!crew_user_id) {
      return res.status(400).json({
        success: false,
        error: 'crew_user_id wajib disertakan.',
      });
    }

    const { data, error } = await supabase
      .from('crew_applications')
      .insert({
        shift_id: shiftId,
        crew_user_id,
        selection_status: 'APPLIED',
        payout_status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Lamaran shift kru berhasil diajukan!',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/events/portfolio
 * EO uploads a past event as portfolio / showcase catalog
 */
router.post('/portfolio', async (req: Request, res: Response) => {
  try {
    const {
      organizer_id,
      title,
      event_category,
      venue_name,
      start_date,
      end_date,
      attendee_count,
      total_budget,
      description,
      banner_image,
      gallery_photos,
      aftermovie_url,
    } = req.body;

    if (!title || !event_category || !venue_name || !start_date) {
      return res.status(400).json({
        success: false,
        error: 'title, event_category, venue_name, dan start_date wajib diisi.',
      });
    }

    // Insert into events with is_portfolio = true and status = 'COMPLETED'
    const { data, error } = await supabase
      .from('events')
      .insert({
        organizer_id,
        title,
        event_category,
        venue_name,
        start_date,
        end_date: end_date || start_date,
        attendee_count: Number(attendee_count) || 0,
        total_budget: Number(total_budget) || 0,
        description: description || '',
        banner_image: banner_image || null,
        gallery_photos: gallery_photos || [],
        aftermovie_url: aftermovie_url || null,
        status: 'COMPLETED',
        is_portfolio: true,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    invalidateCache('/api/v1/events');

    return res.status(201).json({
      success: true,
      message: 'Portofolio event berhasil diunggah ke katalog!',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/events
 * Create a new live event in production
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      organizer_id,
      title,
      event_category,
      venue_name,
      gps_lat_lng,
      start_date,
      end_date,
      total_budget,
      description,
      banner_image,
    } = req.body;

    const { data, error } = await supabase
      .from('events')
      .insert({
        organizer_id,
        title,
        event_category,
        venue_name,
        gps_lat_lng,
        start_date,
        end_date,
        total_budget: Number(total_budget) || 0,
        description,
        banner_image,
        status: 'PUBLISHED',
        is_portfolio: false,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    invalidateCache('/api/v1/events');

    return res.status(201).json({
      success: true,
      message: 'Proyek event baru berhasil dibuat dan siap menerima vendor, kru, & tenant!',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
