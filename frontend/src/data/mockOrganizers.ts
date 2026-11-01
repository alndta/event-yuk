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

export const mockOrganizers: OrganizerItem[] = [
  {
    id: 'eo-1',
    name: 'Nusantara Live Kreasi',
    category: 'CONCERT',
    city: 'Jakarta Selatan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    bannerImage: '/assets/hero-concert.jpg',
    rating: 4.95,
    totalEventsCompleted: 28,
    totalAttendeesServed: '320.000+',
    verified: true,
    specialties: ['Festival Musik Terbuka', 'Konser Internasional', 'Sound & Stage Massive'],
    description: 'Promotor dan Event Organizer berpengalaman 8 tahun dalam menggarap konser musik skala 10.000+ penonton dengan standarisasi crowd safety tinggi.',
    contactEmail: 'kerjasama@nusantaralive.id',
    phone: '+62 811-2233-4455',
    pastHighlightEvents: ['Soundfest Archipelago 2026', 'Java Indie Explosion 2025', 'Jakarta Rock Symphony'],
  },
  {
    id: 'eo-2',
    name: 'OSIS & Komite Labschool Rawamangun',
    category: 'PENSI',
    city: 'Jakarta Timur',
    avatar: '/assets/crew-production.jpg',
    bannerImage: '/assets/band-folk.jpg',
    rating: 4.88,
    totalEventsCompleted: 14,
    totalAttendeesServed: '45.000+',
    verified: true,
    specialties: ['Pentas Seni Sekolah', 'Youth Culture Gathering', 'Bazaar Kreatif Pelajar'],
    description: 'Penyelenggara pensi legendaris sekolah menengah atas di Jakarta dengan perputaran tenant bazaar dan line-up bintang tamu papan atas Indonesia.',
    contactEmail: 'pensi@labschool-rawamangun.sch.id',
    phone: '+62 812-9900-1122',
    pastHighlightEvents: ['RETROSPEKTA 2026', 'Labs Project Vol. 12', 'Senandung Pelajar Ibukota'],
  },
  {
    id: 'eo-3',
    name: 'Kolektif Ruang Rasa',
    category: 'EXPO',
    city: 'Bandung',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    bannerImage: '/assets/tenant-bazaar.jpg',
    rating: 4.9,
    totalEventsCompleted: 19,
    totalAttendeesServed: '85.000+',
    verified: true,
    specialties: ['Artisan Coffee Expo', 'Culinary Showcase', 'Pop-up Creative Market'],
    description: 'Kurator pameran industri kreatif F&B dan lifestyle indie dengan konsep visual venue estetis dan sistem pengelolaan tenant terintegrasi.',
    contactEmail: 'halo@ruangrasa.co.id',
    phone: '+62 813-7744-9988',
    pastHighlightEvents: ['Urban Coffee Bazaar Vol. 4', 'Bandung Culinary Weekend', 'West Java Roaster Fest'],
  },
  {
    id: 'eo-4',
    name: 'Apex MICE & Exhibition Planner',
    category: 'CORPORATE',
    city: 'Surabaya',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    bannerImage: '/assets/sponsor-activation.jpg',
    rating: 4.82,
    totalEventsCompleted: 22,
    totalAttendeesServed: '60.000+',
    verified: true,
    specialties: ['B2B Trade Expo', 'Tech Startup Summit', 'Corporate Anniversary'],
    description: 'Spesialis perancangan pameran multiproduk B2B, konstruksi booth custom kaveling, dan sistem registrasi barcode pengunjung berskala ribuan orang.',
    contactEmail: 'partnership@apex-mice.com',
    phone: '+62 818-0555-4321',
    pastHighlightEvents: ['East Java Tech Expo 2026', 'Surabaya Otomotif Gathering', 'Maritime Logistics Forum'],
  },
];
