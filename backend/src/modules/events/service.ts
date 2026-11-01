import { matchesQuery } from '../../shared/search';
import { badRequest, conflict, forbidden, notFound } from '../../shared/errors';
import type { IdentityApi } from '../identity';
import type { EventDetail, EventRecord, EventRepository } from './ports';
import type { CreateEventInput, CreatePortfolioInput } from './schemas';

export type ProposalKind = 'VENDOR' | 'TALENT' | 'TENANT' | 'CREW' | 'SPONSOR';

/** The small slice of an event that other modules need. */
export interface EventSummary {
  id: string;
  title: string;
  category: string;
  venueName: string;
  startDate: string;
  organizerId: string;
  status: string;
  isPortfolio: boolean;
  acceptsProposalsFrom: Record<ProposalKind, boolean>;
}

const summarize = (e: EventRecord): EventSummary => ({
  id: e.id,
  title: e.title,
  category: e.category,
  venueName: e.venueName,
  startDate: e.startDate,
  organizerId: e.organizerId,
  status: e.status,
  isPortfolio: e.isPortfolio,
  acceptsProposalsFrom: {
    VENDOR: e.allowVendorProposals,
    TALENT: e.allowTalentProposals,
    TENANT: e.allowTenantRegistrations,
    CREW: e.allowCrewApplications,
    SPONSOR: true,
  },
});

export class EventsService {
  constructor(
    private readonly repo: EventRepository,
    private readonly identity: IdentityApi
  ) {}

  /** Public shape: the organizer is shown by business name and verification only, never by contact details. */
  private async present(details: EventDetail[]) {
    const organizers = new Map((await this.identity.listPublicProfiles('EO')).map((p) => [p.userId, p]));
    return details.map(({ event: e, booths, shifts, sponsorshipPackages, vendorBookingCount }) => {
      const org = organizers.get(e.organizerId);
      return {
        id: e.id,
        organizer_id: e.organizerId,
        title: e.title,
        event_category: e.category,
        venue_name: e.venueName,
        gps_lat_lng: e.gpsLatLng,
        start_date: e.startDate,
        end_date: e.endDate,
        total_budget: e.totalBudget,
        description: e.description,
        banner_image: e.bannerImage,
        gallery_photos: e.galleryPhotos,
        aftermovie_url: e.aftermovieUrl,
        attendee_count: e.attendeeCount,
        status: e.status,
        is_portfolio: e.isPortfolio,
        is_invite_only: e.isInviteOnly,
        allow_vendor_proposals: e.allowVendorProposals,
        allow_talent_proposals: e.allowTalentProposals,
        allow_tenant_registrations: e.allowTenantRegistrations,
        allow_crew_applications: e.allowCrewApplications,
        created_at: e.createdAt,
        organizer: org ? { id: org.userId, full_name: org.name, kyc_status: org.verified ? 'VERIFIED' : 'UNVERIFIED' } : null,
        tenant_booths: booths.map((b) => ({
          id: b.id,
          booth_code: b.boothCode,
          booth_category: b.boothCategory,
          size_dimension: b.sizeDimension,
          rental_price: b.rentalPrice,
          is_occupied: b.isOccupied,
        })),
        crew_shifts: shifts.map((s) => ({
          id: s.id,
          role_title: s.roleTitle,
          shift_date: s.shiftDate,
          start_time: s.startTime,
          end_time: s.endTime,
          headcount_req: s.headcountReq,
          rate_per_shift: s.ratePerShift,
        })),
        sponsorship_packages: sponsorshipPackages.map((p) => ({
          id: p.id,
          tier: p.tier,
          package_name: p.packageName,
          price: p.price,
          booth_size: p.boothSize,
          benefits: p.benefits,
          slots_total: p.slotsTotal,
          slots_booked: p.slotsBooked,
        })),
        vendor_booking_count: vendorBookingCount,
      };
    });
  }

  async list(filter: { type?: 'portfolio' | 'live'; category?: EventRecord['category']; q?: string; city?: string }) {
    const rows = await this.repo.list({
      portfolio: filter.type === undefined ? undefined : filter.type === 'portfolio',
      category: filter.category,
    });
    // Draft and cancelled projects are not listed publicly.
    const visible = rows.filter((r) => r.event.status === 'PUBLISHED' || r.event.status === 'ONGOING' || r.event.status === 'COMPLETED');
    const organizers = new Map((await this.identity.listPublicProfiles('EO')).map((p) => [p.userId, p]));
    const found = visible.filter((r) => {
      const org = organizers.get(r.event.organizerId);
      return (
        matchesQuery(filter.q, [r.event.title, r.event.venueName, r.event.category, org?.name]) &&
        matchesQuery(filter.city, [r.event.venueName, org?.cityRegion])
      );
    });
    return this.present(found);
  }

  async get(id: string) {
    const row = await this.repo.get(id);
    if (!row || row.event.status === 'DRAFT' || row.event.status === 'CANCELLED') throw notFound('Acara tidak ditemukan.');
    return (await this.present([row]))[0];
  }

  async create(organizerId: string, input: CreateEventInput) {
    const event = await this.repo.create({
      organizerId,
      title: input.title,
      category: input.event_category,
      venueName: input.venue_name,
      gpsLatLng: input.gps_lat_lng ?? null,
      startDate: input.start_date,
      endDate: input.end_date,
      totalBudget: input.total_budget,
      description: input.description,
      bannerImage: input.banner_image ?? null,
      status: 'PUBLISHED',
      isPortfolio: false,
      allowVendorProposals: input.allow_vendor_proposals ?? true,
      allowTalentProposals: input.allow_talent_proposals ?? true,
      allowTenantRegistrations: input.allow_tenant_registrations ?? true,
      allowCrewApplications: input.allow_crew_applications ?? true,
      isInviteOnly: input.is_invite_only ?? false,
    });
    return (await this.present([{ event, booths: [], shifts: [], sponsorshipPackages: [], vendorBookingCount: 0 }]))[0];
  }

  async createPortfolio(organizerId: string, input: CreatePortfolioInput) {
    const event = await this.repo.create({
      organizerId,
      title: input.title,
      category: input.event_category,
      venueName: input.venue_name,
      startDate: input.start_date,
      endDate: input.end_date ?? input.start_date,
      totalBudget: input.total_budget,
      description: input.description,
      bannerImage: input.banner_image ?? null,
      galleryPhotos: input.gallery_photos,
      aftermovieUrl: input.aftermovie_url ?? null,
      attendeeCount: input.attendee_count,
      status: 'COMPLETED',
      isPortfolio: true,
    });
    return (await this.present([{ event, booths: [], shifts: [], sponsorshipPackages: [], vendorBookingCount: 0 }]))[0];
  }

  private async openEvent(eventId: string): Promise<EventRecord> {
    const row = await this.repo.get(eventId);
    if (!row) throw notFound('Acara tidak ditemukan.');
    const { event } = row;
    if (event.isPortfolio || (event.status !== 'PUBLISHED' && event.status !== 'ONGOING')) {
      throw badRequest('Acara ini tidak membuka pendaftaran.');
    }
    return event;
  }

  async registerBooth(tenantId: string, eventId: string, boothId: string, input: { brand_name: string; product_photos: string[] }) {
    const event = await this.openEvent(eventId);
    if (event.organizerId === tenantId) throw forbidden('Penyelenggara tidak bisa menyewa booth acaranya sendiri.');
    if (!event.allowTenantRegistrations || event.isInviteOnly) throw forbidden('Acara ini tidak membuka pendaftaran tenant.');
    const registration = await this.repo.registerTenant({
      eventId,
      boothId,
      tenantId,
      brandName: input.brand_name,
      productPhotos: input.product_photos,
    });
    if (!registration) throw conflict('Booth ini sudah terisi atau bukan bagian dari acara ini.');
    return registration;
  }

  async applyToShift(crewId: string, eventId: string, shiftId: string) {
    const event = await this.openEvent(eventId);
    if (!event.allowCrewApplications || event.isInviteOnly) throw forbidden('Acara ini tidak membuka rekrutmen kru.');
    const application = await this.repo.applyToShift({ eventId, shiftId, crewId });
    if (!application) throw notFound('Shift tidak ditemukan di acara ini.');
    return application;
  }

  // ---------------------------------------------------------------- for other modules

  async getSummary(eventId: string): Promise<EventSummary | null> {
    const row = await this.repo.get(eventId);
    return row ? summarize(row.event) : null;
  }

  /** Activity for the "my catalog" screen of roles whose data lives in this module. */
  async activityFor(userId: string, role: 'EO' | 'TENANT' | 'CREW'): Promise<unknown[]> {
    if (role === 'EO') return this.present(await this.repo.listByOrganizer(userId));
    if (role === 'TENANT') return this.repo.listTenantRegistrations(userId);
    return this.repo.listCrewApplications(userId);
  }
}
