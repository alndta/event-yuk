// Shapes the pages render. The data itself always comes from the API.

export interface EventItem {
  id: string;
  /** Account id of the organizer; needed to address a proposal to them. */
  organizerId?: string;
  title: string;
  category: 'CONCERT' | 'PENSI' | 'EXPO' | 'BAZAAR';
  organizer: {
    name: string;
    avatar: string;
    verified: boolean;
    city: string;
  };
  venue: string;
  date: string;
  description: string;
  bannerImage: string;
  isPortfolio: boolean;
  // Khusus Live In Making
  progress?: {
    stage: string;
    vendorFilled: number; // e.g. 80%
    boothFilled: number; // e.g. 14 / 20
    crewNeeded: number; // e.g. 8 orang lagi
  };
  // Khusus Past Portfolio
  stats?: {
    attendees: string;
    budget: string;
    rating: number;
    aftermovieUrl?: string;
  };
}

export interface PartnerItem {
  id: string;
  name: string;
  type: 'VENDOR' | 'TALENT' | 'SPONSOR';
  categoryLabel: string;
  city: string;
  rating: number;
  avatar: string;
  priceRange: string;
  specsOrRiders: string[];
  description: string;
  genreOrCategory?: string;
  managerContact?: string;
  experienceYears?: number;
  completedGigs?: number;
}

export interface OrganizerItem {
  id: string;
  name: string;
  category: 'CONCERT' | 'PENSI' | 'EXPO' | 'CORPORATE';
  city: string;
  avatar: string;
  bannerImage: string;
  rating: number;
  totalEventsCompleted: number;
  totalAttendeesServed: string;
  verified: boolean;
  specialties: string[];
  description: string;
  contactEmail: string;
  phone: string;
  pastHighlightEvents: string[];
}
