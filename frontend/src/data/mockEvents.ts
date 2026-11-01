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

export const initialEvents: EventItem[] = [
  // 1. LIVE EVENT SEDANG DIBUAT
  {
    id: 'live-1',
    title: 'Soundfest Archipelago 2027: Indie Waves',
    category: 'CONCERT',
    organizer: {
      name: 'Nusantara Live Kreasi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verified: true,
      city: 'Jakarta Selatan',
    },
    venue: 'Plaza Barat Senayan, GBK',
    date: '15 - 16 Mei 2027',
    description: 'Festival musik indie dua hari dengan 24 artis nasional. Penyelenggara sedang memilih tenant F&B dan mencari 40 kru lapangan.',
    bannerImage: '/assets/hero-concert.jpg',
    isPortfolio: false,
    progress: {
      stage: 'Tahap 2: Pengadaan Vendor & Tenant',
      vendorFilled: 75,
      boothFilled: 16,
      crewNeeded: 12,
    },
  },
  {
    id: 'live-2',
    title: 'Pensi SMA Labschool Rawamangun: RETROSPEKTA 2027',
    category: 'PENSI',
    organizer: {
      name: 'OSIS Labschool Rawamangun',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
      verified: true,
      city: 'Jakarta Timur',
    },
    venue: 'Hall Basket Gelora Bung Karno',
    date: '28 Juni 2027',
    description: 'Pentas seni Labschool Rawamangun dengan band pop-rock sebagai bintang tamu. Pendaftaran tenant dan penawaran vendor rigging sedang dibuka.',
    bannerImage: '/assets/band-folk.jpg',
    isPortfolio: false,
    progress: {
      stage: 'Tahap 1: Open Tenant & Vendor Rigging',
      vendorFilled: 50,
      boothFilled: 8,
      crewNeeded: 25,
    },
  },
  {
    id: 'live-3',
    title: 'Urban Coffee & Craft Bazaar Vol. 5',
    category: 'BAZAAR',
    organizer: {
      name: 'Kolektif Ruang Rasa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      verified: true,
      city: 'Bandung',
    },
    venue: 'Gudang Selatan, Bandung',
    date: '10 - 12 Juli 2027',
    description: 'Bazaar dengan 50 roaster kopi, artisan, merek apparel lokal, dan tenant kuliner. Pendaftaran tenant masih dibuka.',
    bannerImage: '/assets/tenant-bazaar.jpg',
    isPortfolio: false,
    progress: {
      stage: 'Tahap 3: Finalisasi Kaveling Denah',
      vendorFilled: 90,
      boothFilled: 38,
      crewNeeded: 5,
    },
  },

  // 2. PAST EVENT CATALOG / PORTFOLIO
  {
    id: 'port-1',
    title: 'Glow In The Dark: Neon Run & EDM Fest 2026',
    category: 'CONCERT',
    organizer: {
      name: 'Nusantara Live Kreasi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verified: true,
      city: 'Jakarta Selatan',
    },
    venue: 'Ecopark Ancol, Jakarta',
    date: '18 Oktober 2026',
    description: 'Lari malam 5K dengan panggung musik, pencahayaan 80.000 watt, dan sound system line array. Acara ini melibatkan 65 kru.',
    bannerImage: '/assets/crowd-festival.jpg',
    isPortfolio: true,
    stats: {
      attendees: '14.200 Orang',
      budget: 'Rp 650.000.000',
      rating: 4.9,
      aftermovieUrl: 'https://youtube.com',
    },
  },
  {
    id: 'port-2',
    title: 'Kreatif Fest Jawa Barat: 100 UMKM & Expo',
    category: 'EXPO',
    organizer: {
      name: 'Kolektif Ruang Rasa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      verified: true,
      city: 'Bandung',
    },
    venue: 'Sasana Budaya Ganesha (Sabuga)',
    date: '2 - 4 Agustus 2026',
    description: 'Pameran multiproduk di Bandung dengan 100 UMKM fashion dan kuliner. Penyelenggara menata nomor kaveling secara digital.',
    bannerImage: '/assets/tenant-food.jpg',
    isPortfolio: true,
    stats: {
      attendees: '28.500 Orang',
      budget: 'Rp 420.000.000',
      rating: 4.8,
      aftermovieUrl: 'https://youtube.com',
    },
  },
  {
    id: 'port-3',
    title: 'Symphony Kampus: Pensi Megah SMAN 8 2026',
    category: 'PENSI',
    organizer: {
      name: 'Panitia Symphony 8',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      verified: true,
      city: 'Jakarta Selatan',
    },
    venue: 'Tennis Indoor Senayan',
    date: '14 November 2026',
    description: 'Pentas seni sekolah dengan tiga guest stars. Kru ticketing, usher, dan keamanan lapangan menggunakan presensi QR.',
    bannerImage: '/assets/vendor-rigging.jpg',
    isPortfolio: true,
    stats: {
      attendees: '6.800 Siswa & Publik',
      budget: 'Rp 380.000.000',
      rating: 5.0,
      aftermovieUrl: 'https://youtube.com',
    },
  },
];
