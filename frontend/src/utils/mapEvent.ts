import type { EventItem } from '../types/models';

/** Turns an event from the API into the shape the pages render. */
export function mapBackendEvent(ev: any): EventItem {
  const booths: any[] = ev.tenant_booths || [];
  const taken = booths.filter((b) => b.is_occupied).length;
  return {
    id: ev.id,
    organizerId: ev.organizer_id,
    title: ev.title,
    category: ev.event_category || 'CONCERT',
    organizer: {
      name: ev.organizer?.full_name || 'Event Organizer',
      avatar: '/assets/crew-production.jpg',
      verified: ev.organizer?.kyc_status === 'VERIFIED',
      city: '',
    },
    venue: ev.venue_name || '',
    date: ev.start_date ? new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA',
    description: ev.description || '',
    bannerImage: ev.banner_image || '/assets/hero-concert.jpg',
    isPortfolio: Boolean(ev.is_portfolio),
    sponsorshipPackages: (ev.sponsorship_packages || []).map((x: any) => ({
      id: x.id,
      tier: x.tier,
      name: x.package_name,
      price: Number(x.price) || 0,
      boothSize: x.booth_size ?? null,
      benefits: Array.isArray(x.benefits) ? x.benefits.map(String) : x.benefits && typeof x.benefits === 'object' ? Object.values(x.benefits).map(String) : [],
      slotsLeft: Math.max(0, (x.slots_total || 0) - (x.slots_booked || 0)),
    })),
    progress: ev.is_portfolio
      ? undefined
      : {
          stage: ev.status === 'ONGOING' ? 'Acara sedang berjalan' : 'Persiapan acara',
          vendorFilled: booths.length ? Math.round((taken / booths.length) * 100) : 0,
          boothFilled: taken,
          crewNeeded: (ev.crew_shifts || []).reduce((n: number, s: any) => n + (s.headcount_req || 0), 0),
        },
    stats: ev.is_portfolio
      ? {
          attendees: `${(ev.attendee_count || 0).toLocaleString('id-ID')} Pengunjung`,
          budget: `Rp ${(ev.total_budget || 0).toLocaleString('id-ID')}`,
          rating: 0,
          aftermovieUrl: ev.aftermovie_url,
        }
      : undefined,
  };
}
