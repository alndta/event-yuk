import { AppError, conflict } from '../../../shared/errors';
import type { Db } from '../../../shared/db/supabase';
import type {
  BoothRecord,
  EventDetail,
  EventRecord,
  EventRepository,
  NewEvent,
  ApplicantRecord,
  DecidedApplicant,
  ShiftRecord,
  SponsorshipPackageRecord,
} from '../ports';

const DETAIL_SELECT = '*, tenant_booths (*), crew_shifts (*), sponsorship_packages (*), vendor_bookings (id)';

function fail(_error: { message: string }): never {
  throw new AppError(500, 'DATABASE_ERROR', 'Terjadi kesalahan pada penyimpanan data.');
}

const toEvent = (r: any): EventRecord => ({
  id: r.id,
  organizerId: r.organizer_id,
  title: r.title,
  category: r.event_category,
  venueName: r.venue_name,
  gpsLatLng: r.gps_lat_lng ?? null,
  startDate: r.start_date,
  endDate: r.end_date,
  totalBudget: Number(r.total_budget ?? 0),
  description: r.description ?? '',
  bannerImage: r.banner_image ?? null,
  galleryPhotos: Array.isArray(r.gallery_photos) ? r.gallery_photos : [],
  aftermovieUrl: r.aftermovie_url ?? null,
  attendeeCount: Number(r.attendee_count ?? 0),
  status: r.status ?? 'DRAFT',
  isPortfolio: Boolean(r.is_portfolio),
  allowVendorProposals: r.allow_vendor_proposals ?? true,
  allowTalentProposals: r.allow_talent_proposals ?? true,
  allowTenantRegistrations: r.allow_tenant_registrations ?? true,
  allowCrewApplications: r.allow_crew_applications ?? true,
  isInviteOnly: Boolean(r.is_invite_only),
  createdAt: r.created_at,
});

const toBooth = (r: any): BoothRecord => ({
  id: r.id,
  eventId: r.event_id,
  boothCode: r.booth_code,
  boothCategory: r.booth_category,
  sizeDimension: r.size_dimension ?? null,
  rentalPrice: Number(r.rental_price),
  isOccupied: Boolean(r.is_occupied),
});

const toShift = (r: any): ShiftRecord => ({
  id: r.id,
  eventId: r.event_id,
  roleTitle: r.role_title,
  shiftDate: r.shift_date,
  startTime: r.start_time,
  endTime: r.end_time,
  headcountReq: Number(r.headcount_req),
  ratePerShift: Number(r.rate_per_shift),
});

const toPackage = (r: any): SponsorshipPackageRecord => ({
  id: r.id,
  eventId: r.event_id,
  tier: r.tier,
  packageName: r.package_name,
  price: Number(r.price),
  boothSize: r.booth_size ?? null,
  benefits: r.benefits ?? [],
  slotsTotal: Number(r.slots_total ?? 0),
  slotsBooked: Number(r.slots_booked ?? 0),
  isActive: r.is_active ?? true,
});

const toDetail = (r: any): EventDetail => ({
  event: toEvent(r),
  booths: (r.tenant_booths ?? []).map(toBooth),
  shifts: (r.crew_shifts ?? []).map(toShift),
  sponsorshipPackages: (r.sponsorship_packages ?? []).filter((p: any) => p.is_active !== false).map(toPackage),
  vendorBookingCount: (r.vendor_bookings ?? []).length,
});

export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly db: Db) {}

  async list(filter: { portfolio?: boolean; category?: string }) {
    let query = this.db.from('events').select(DETAIL_SELECT);
    if (filter.portfolio !== undefined) query = query.eq('is_portfolio', filter.portfolio);
    if (filter.category) query = query.eq('event_category', filter.category);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(200);
    if (error) fail(error);
    return (data ?? []).map(toDetail);
  }

  async get(id: string) {
    const { data, error } = await this.db.from('events').select(DETAIL_SELECT).eq('id', id).maybeSingle();
    if (error) fail(error);
    return data ? toDetail(data) : null;
  }

  async create(input: NewEvent) {
    const { data, error } = await this.db
      .from('events')
      .insert({
        organizer_id: input.organizerId,
        title: input.title,
        event_category: input.category,
        venue_name: input.venueName,
        gps_lat_lng: input.gpsLatLng ?? null,
        start_date: input.startDate,
        end_date: input.endDate,
        total_budget: input.totalBudget,
        description: input.description,
        banner_image: input.bannerImage ?? null,
        gallery_photos: input.galleryPhotos ?? [],
        aftermovie_url: input.aftermovieUrl ?? null,
        attendee_count: input.attendeeCount ?? 0,
        status: input.status,
        is_portfolio: input.isPortfolio,
        allow_vendor_proposals: input.allowVendorProposals ?? true,
        allow_talent_proposals: input.allowTalentProposals ?? true,
        allow_tenant_registrations: input.allowTenantRegistrations ?? true,
        allow_crew_applications: input.allowCrewApplications ?? true,
        is_invite_only: input.isInviteOnly ?? false,
      })
      .select('*')
      .single();
    if (error) fail(error);
    return toEvent(data);
  }

  async registerTenant(input: { eventId: string; boothId: string; tenantId: string; brandName: string; productPhotos: string[] }) {
    // Claim the booth first. The conditional update is atomic, so two tenants cannot both win.
    const { data: claimed, error: claimError } = await this.db
      .from('tenant_booths')
      .update({ is_occupied: true })
      .eq('id', input.boothId)
      .eq('event_id', input.eventId)
      .eq('is_occupied', false)
      .select('id');
    if (claimError) fail(claimError);
    if (!claimed || claimed.length === 0) return null;

    const { data, error } = await this.db
      .from('tenant_registrations')
      .insert({ booth_id: input.boothId, tenant_user_id: input.tenantId, brand_name: input.brandName, product_photos: input.productPhotos, curation_status: 'PENDING' })
      .select('id')
      .single();
    if (error) {
      await this.db.from('tenant_booths').update({ is_occupied: false }).eq('id', input.boothId);
      fail(error);
    }
    return { id: (data as { id: string }).id };
  }

  async applyToShift(input: { eventId: string; shiftId: string; crewId: string }) {
    const { data: shift, error: shiftError } = await this.db.from('crew_shifts').select('id').eq('id', input.shiftId).eq('event_id', input.eventId).maybeSingle();
    if (shiftError) fail(shiftError);
    if (!shift) return null;

    const { data, error } = await this.db
      .from('crew_applications')
      .insert({ shift_id: input.shiftId, crew_user_id: input.crewId, selection_status: 'APPLIED', payout_status: 'PENDING' })
      .select('id')
      .single();
    if (error) {
      if (error.code === '23505') throw conflict('Kamu sudah melamar shift ini.');
      fail(error);
    }
    return { id: (data as { id: string }).id };
  }

  async listByOrganizer(organizerId: string) {
    const { data, error } = await this.db.from('events').select(DETAIL_SELECT).eq('organizer_id', organizerId).order('created_at', { ascending: false });
    if (error) fail(error);
    return (data ?? []).map(toDetail);
  }

  async listTenantRegistrations(tenantId: string) {
    const { data, error } = await this.db.from('tenant_registrations').select('*, tenant_booths (*)').eq('tenant_user_id', tenantId);
    if (error) fail(error);
    return data ?? [];
  }

  async listCrewApplications(crewId: string) {
    const { data, error } = await this.db.from('crew_applications').select('*, crew_shifts (*, events (title, venue_name, start_date))').eq('crew_user_id', crewId);
    if (error) fail(error);
    return data ?? [];
  }

  // The review screens read a few joined tables; the generated types do not model those joins, so they are addressed loosely.
  private get raw() {
    return this.db as any;
  }

  private async ownEvents(organizerId: string): Promise<Map<string, string>> {
    const { data, error } = await this.raw.from('events').select('id, title').eq('organizer_id', organizerId);
    if (error) fail(error);
    return new Map((data ?? []).map((e: any) => [e.id, e.title]));
  }

  async listApplicants(organizerId: string) {
    const events = await this.ownEvents(organizerId);
    const ids = [...events.keys()];
    if (ids.length === 0) return { tenants: [], crew: [] };

    const [tenantRes, crewRes] = await Promise.all([
      this.raw.from('tenant_registrations').select('id, brand_name, curation_status, created_at, tenant_user_id, tenant:tenant_user_id (full_name), booth:booth_id (event_id, booth_code, booth_category)').order('created_at', { ascending: false }).limit(300),
      this.raw.from('crew_applications').select('id, selection_status, created_at, crew_user_id, crew:crew_user_id (full_name), shift:shift_id (event_id, role_title, shift_date)').order('created_at', { ascending: false }).limit(300),
    ]);
    if (tenantRes.error) fail(tenantRes.error);
    if (crewRes.error) fail(crewRes.error);

    const tenants: ApplicantRecord[] = (tenantRes.data ?? [])
      .filter((r: any) => r.booth && events.has(r.booth.event_id))
      .map((r: any) => ({
        id: r.id,
        userId: r.tenant_user_id,
        name: r.brand_name || r.tenant?.full_name || '',
        status: r.curation_status,
        eventId: r.booth.event_id,
        eventTitle: events.get(r.booth.event_id) ?? '',
        label: r.booth.booth_code,
        detail: r.tenant?.full_name ?? null,
        createdAt: r.created_at,
      }));
    const crew: ApplicantRecord[] = (crewRes.data ?? [])
      .filter((r: any) => r.shift && events.has(r.shift.event_id))
      .map((r: any) => ({
        id: r.id,
        userId: r.crew_user_id,
        name: r.crew?.full_name ?? '',
        status: r.selection_status,
        eventId: r.shift.event_id,
        eventTitle: events.get(r.shift.event_id) ?? '',
        label: r.shift.role_title,
        detail: r.shift.shift_date,
        createdAt: r.created_at,
      }));
    return { tenants, crew };
  }

  async decideTenant(input: { organizerId: string; registrationId: string; approve: boolean }): Promise<DecidedApplicant | null> {
    const events = await this.ownEvents(input.organizerId);
    const { data: reg, error } = await this.raw.from('tenant_registrations').select('id, tenant_user_id, curation_status, booth_id, booth:booth_id (event_id, booth_code)').eq('id', input.registrationId).maybeSingle();
    if (error) fail(error);
    if (!reg || !reg.booth || !events.has(reg.booth.event_id) || reg.curation_status !== 'PENDING') return null;

    // Conditional on PENDING, so two quick clicks cannot decide twice.
    const { data: done, error: updateError } = await this.raw
      .from('tenant_registrations')
      .update({ curation_status: input.approve ? 'APPROVED' : 'REJECTED' })
      .eq('id', input.registrationId)
      .eq('curation_status', 'PENDING')
      .select('id');
    if (updateError) fail(updateError);
    if (!done || done.length === 0) return null;
    if (!input.approve) await this.raw.from('tenant_booths').update({ is_occupied: false }).eq('id', reg.booth_id);
    return { userId: reg.tenant_user_id, eventTitle: events.get(reg.booth.event_id) ?? '', label: reg.booth.booth_code };
  }

  async decideCrew(input: { organizerId: string; applicationId: string; approve: boolean }): Promise<DecidedApplicant | null> {
    const events = await this.ownEvents(input.organizerId);
    const { data: app, error } = await this.raw.from('crew_applications').select('id, crew_user_id, selection_status, shift_id, shift:shift_id (event_id, role_title, headcount_req)').eq('id', input.applicationId).maybeSingle();
    if (error) fail(error);
    if (!app || !app.shift || !events.has(app.shift.event_id) || app.selection_status !== 'APPLIED') return null;

    if (input.approve) {
      const { count, error: countError } = await this.raw.from('crew_applications').select('id', { count: 'exact', head: true }).eq('shift_id', app.shift_id).eq('selection_status', 'HIRED');
      if (countError) fail(countError);
      if ((count ?? 0) >= app.shift.headcount_req) throw conflict('Kuota shift ini sudah penuh.');
    }
    const { data: done, error: updateError } = await this.raw
      .from('crew_applications')
      .update({ selection_status: input.approve ? 'HIRED' : 'REJECTED' })
      .eq('id', input.applicationId)
      .eq('selection_status', 'APPLIED')
      .select('id');
    if (updateError) fail(updateError);
    if (!done || done.length === 0) return null;
    return { userId: app.crew_user_id, eventTitle: events.get(app.shift.event_id) ?? '', label: app.shift.role_title };
  }
}
