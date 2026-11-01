export type EventCategory = 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventRecord {
  id: string;
  organizerId: string;
  title: string;
  category: EventCategory;
  venueName: string;
  gpsLatLng: string | null;
  startDate: string;
  endDate: string;
  totalBudget: number;
  description: string;
  bannerImage: string | null;
  galleryPhotos: string[];
  aftermovieUrl: string | null;
  attendeeCount: number;
  status: EventStatus;
  isPortfolio: boolean;
  allowVendorProposals: boolean;
  allowTalentProposals: boolean;
  allowTenantRegistrations: boolean;
  allowCrewApplications: boolean;
  isInviteOnly: boolean;
  createdAt: string;
}

export interface BoothRecord {
  id: string;
  eventId: string;
  boothCode: string;
  boothCategory: string;
  sizeDimension: string | null;
  rentalPrice: number;
  isOccupied: boolean;
}

export interface ShiftRecord {
  id: string;
  eventId: string;
  roleTitle: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  headcountReq: number;
  ratePerShift: number;
}

export interface SponsorshipPackageRecord {
  id: string;
  eventId: string;
  tier: string;
  packageName: string;
  price: number;
  boothSize: string | null;
  benefits: unknown;
  slotsTotal: number;
  slotsBooked: number;
  isActive: boolean;
}

export interface EventDetail {
  event: EventRecord;
  booths: BoothRecord[];
  shifts: ShiftRecord[];
  sponsorshipPackages: SponsorshipPackageRecord[];
  vendorBookingCount: number;
}

export interface NewEvent {
  organizerId: string;
  title: string;
  category: EventCategory;
  venueName: string;
  gpsLatLng?: string | null;
  startDate: string;
  endDate: string;
  totalBudget: number;
  description: string;
  bannerImage?: string | null;
  galleryPhotos?: string[];
  aftermovieUrl?: string | null;
  attendeeCount?: number;
  status: EventStatus;
  isPortfolio: boolean;
  allowVendorProposals?: boolean;
  allowTalentProposals?: boolean;
  allowTenantRegistrations?: boolean;
  allowCrewApplications?: boolean;
  isInviteOnly?: boolean;
}

export interface EventRepository {
  list(filter: { portfolio?: boolean; category?: EventCategory }): Promise<EventDetail[]>;
  get(id: string): Promise<EventDetail | null>;
  create(input: NewEvent): Promise<EventRecord>;
  /** Registers the tenant on an unoccupied booth of this event. Returns null when the booth is taken or not part of the event. */
  registerTenant(input: { eventId: string; boothId: string; tenantId: string; brandName: string; productPhotos: string[] }): Promise<{ id: string } | null>;
  /** Throws a 409 AppError when the crew member already applied. Returns null when the shift is not part of the event. */
  applyToShift(input: { eventId: string; shiftId: string; crewId: string }): Promise<{ id: string } | null>;
  listByOrganizer(organizerId: string): Promise<EventDetail[]>;
  listTenantRegistrations(tenantId: string): Promise<unknown[]>;
  listCrewApplications(crewId: string): Promise<unknown[]>;
  /** Pending and decided applicants for every event the organizer owns. */
  listApplicants(organizerId: string): Promise<{ tenants: ApplicantRecord[]; crew: ApplicantRecord[] }>;
  /**
   * Decides a tenant's booth registration that is still pending and belongs to one of the organizer's events.
   * A rejection frees the booth. Returns the applicant, or null when there is nothing to decide.
   */
  decideTenant(input: { organizerId: string; registrationId: string; approve: boolean }): Promise<DecidedApplicant | null>;
  /** Same for crew. Hiring stops once the shift's headcount is full (throws a 409 AppError). */
  decideCrew(input: { organizerId: string; applicationId: string; approve: boolean }): Promise<DecidedApplicant | null>;
}

export interface ApplicantRecord {
  id: string;
  userId: string;
  name: string;
  status: string;
  eventId: string;
  eventTitle: string;
  /** Booth code or shift role. */
  label: string;
  detail: string | null;
  createdAt: string | null;
}

export interface DecidedApplicant {
  userId: string;
  eventTitle: string;
  label: string;
}
