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

export const mockPartners: PartnerItem[] = [
  // VENDORS
  {
    id: 'ven-1',
    name: 'Nusantara Audio & Rigging Pro',
    type: 'VENDOR',
    categoryLabel: 'Sound System & Rigging Panggung',
    city: 'Jakarta Barat',
    rating: 4.95,
    avatar: '/assets/vendor-sound.jpg',
    priceRange: 'Rp 25.000.000 - Rp 85.000.000 / Hari',
    specsOrRiders: [
      'Line Array Speaker 40.000 Watt RMS (L-Acoustics K2 replica/JBL VTX)',
      'Rigging Alumunium 12x10m Heavy Duty dengan sertifikasi uji beban',
      'Digital Mixer Yamaha CL5 + Stagebox 48ch & Dante Network',
      'Genset Silent 100 kVA Silent Unit & Kabel Distribusi Heavy Duty',
    ],
    description: 'Vendor spesialis panggung konser dan pensi sekolah. Seluruh kru soundman dan teknisi rigging bersertifikasi K3.',
    experienceYears: 9,
    completedGigs: 142,
  },
  {
    id: 'ven-2',
    name: 'Luminary Stage & Visual FX',
    type: 'VENDOR',
    categoryLabel: 'Lighting System & Videotron LED P3.9',
    city: 'Tangerang Selatan',
    rating: 4.88,
    avatar: '/assets/vendor-lighting.jpg',
    priceRange: 'Rp 18.000.000 - Rp 60.000.000 / Hari',
    specsOrRiders: [
      'Videotron LED Screen P3.9 Outdoor Curve Ready (8x4 meter)',
      'Moving Head Beam 380W (24 unit) & Par LED RGBW (36 unit)',
      'Laser RGB 20 Watt + Hazer Machine & CO2 Jet Gun',
      'GrandMA2 Light Console + Media Server Resolume Arena 7',
    ],
    description: 'Spesialis efek visual konser musik, pensi sekolah, dan pameran multiproduk. Dilengkapi operator visual MadMapper profesional.',
    experienceYears: 7,
    completedGigs: 98,
  },
  {
    id: 'ven-3',
    name: 'Kharisma Rigging & Modular Stage',
    type: 'VENDOR',
    categoryLabel: 'Tata Panggung, Barricade & Truss',
    city: 'Bandung',
    rating: 4.82,
    avatar: '/assets/vendor-rigging.jpg',
    priceRange: 'Rp 15.000.000 - Rp 45.000.000 / Hari',
    specsOrRiders: [
      'Panggung Level Modular Multiplex Karpet Hitam 14x10 meter (Tinggi 1.5m)',
      'Barricade Barikade Mojo Anti-Crush Baja 60 meter',
      'FOH Control Tower 2 Lantai dengan Cover Kanopi Anti Hujan',
      'Backstage Tent 6x6m Luxury Series (Lantai Karpet & AC Standing)',
    ],
    description: 'Penyedia infrastruktur rigging panggung kokoh, barikade pembatas penonton berstandar pengamanan festival, dan tenda backstage VIP.',
    experienceYears: 6,
    completedGigs: 76,
  },
  {
    id: 'ven-4',
    name: 'Volta Power Solutions & Genset',
    type: 'VENDOR',
    categoryLabel: 'Genset Silent & Elektrikal Festival',
    city: 'Jakarta Timur',
    rating: 4.9,
    avatar: '/assets/vendor-sound.jpg',
    priceRange: 'Rp 8.000.000 - Rp 25.000.000 / Hari',
    specsOrRiders: [
      'Genset Silent Perkins / Cummins 150 kVA (2 Unit Synchronized)',
      'Box Distribusi Daya 3-Phase dengan MCB Schneider Safety System',
      'Kabel Tray Proteksi Penonton (Yellow Jacket Rubber Cable Protector)',
      'Standby Teknisi Elektrikal 24 Jam Non-Stop selama rangkaian acara',
    ],
    description: 'Layanan daya listrik stabil dan redundansi bebas kedip untuk konser musik besar, bazaar kuliner, dan pameran multimedia.',
    experienceYears: 10,
    completedGigs: 210,
  },

  // TALENT / BAND
  {
    id: 'band-1',
    name: 'Senja Di Batavia',
    type: 'TALENT',
    categoryLabel: 'Indie Rock / Alternative Band',
    genreOrCategory: 'Indie Rock',
    city: 'Jakarta Selatan',
    rating: 4.95,
    avatar: '/assets/band-rock.jpg',
    priceRange: 'Rp 35.000.000 / Show (45-60 Menit)',
    specsOrRiders: [
      'Technical Riders: Drum Kit Tama/Yamaha, 2 Amp Gitar Marshall JCM900, 1 Bass Amp Ampeg SVT, 4 Wireless In-Ear Monitor',
      'Hospitality Riders: Ruang tunggu ber-AC privat, 15 pax konsumsi meals (bebas MSG), air mineral botol 600ml 2 karton',
      'Transportasi & Logistik: 2 Mobil HiAce Commuter untuk rombongan 12 orang kru & personel',
    ],
    description: 'Band pop/indie rock dengan 850.000+ pendengar bulanan Spotify. Berpengalaman tampil di panggung festival nasional dan puluhan pensi kampus se-Indonesia.',
    managerContact: 'Batavia Artist Management (Reza: 0812-9988-7766)',
    completedGigs: 85,
  },
  {
    id: 'band-2',
    name: 'The Midnight Groovers',
    type: 'TALENT',
    categoryLabel: 'Soul, Funk & Jazz Ensemble',
    genreOrCategory: 'Soul & Jazz',
    city: 'Bandung',
    rating: 4.88,
    avatar: '/assets/band-jazz.jpg',
    priceRange: 'Rp 22.000.000 / Show (60 Menit)',
    specsOrRiders: [
      'Technical Riders: 2 Wireless Mic Shure SM58, Keyboard Roland RD2000, Bass DI Box Radial ProD2, Section Horn 2 Mics',
      'Hospitality Riders: Ruang ganti privat dengan cermin rias, snack buah segar, teh hangat & kopi drip',
      'Akomodasi: Hotel minimal bintang 3 bila luar kota Bandung (4 kamar twin bed)',
    ],
    description: 'Kolektif musik soul-funk modern yang sangat cocok untuk atmosfer pameran kreatif, festival kuliner artisan, dan panggung santai.',
    managerContact: 'Groove House Bandung (Dimas: 0813-7788-9900)',
    completedGigs: 64,
  },
  {
    id: 'band-3',
    name: 'Lentera Sore Pop Folk',
    type: 'TALENT',
    categoryLabel: 'Acoustic Pop & Folk Harmonies',
    genreOrCategory: 'Pop Folk',
    city: 'Yogyakarta',
    rating: 4.92,
    avatar: '/assets/band-folk.jpg',
    priceRange: 'Rp 18.000.000 / Show (50 Menit)',
    specsOrRiders: [
      'Technical Riders: 2 Gitar Akustik DI Input, 1 Cello Mic DPA, 1 Cajon Shure Beta 91A, 2 Vocal Condenser',
      'Hospitality Riders: Makanan tradisional khas lokal, air jahe hangat, ruang istirahat tenang',
      'Manajemen: Jogja Nada Records (Aji: 0817-4455-6677)',
    ],
    description: 'Duo akustik dengan aransemen syahdu yang telah mengumpulkan 1.2M streams di platform musik digital, favorit pensi dan festival senja.',
    managerContact: 'Jogja Nada Records (Aji: 0817-4455-6677)',
    completedGigs: 52,
  },
  {
    id: 'band-4',
    name: 'Cyberwave Beats (Live DJ & Synth)',
    type: 'TALENT',
    categoryLabel: 'Electronic Dance Music & Synthwave',
    genreOrCategory: 'EDM & Synth',
    city: 'Jakarta Utara',
    rating: 4.85,
    avatar: '/assets/hero-concert.jpg',
    priceRange: 'Rp 28.000.000 / Show (75 Menit)',
    specsOrRiders: [
      'Technical Riders: Pioneer CDJ-3000 (2 Unit) + DJM-900NXS2, Booth Monitor Genelec/Yamaha HS8, 1 Mic Wireless',
      'Hospitality Riders: Energy drinks 12 kaleng, handuk dingin panggung, ruang VIP ber-AC',
      'Visual: Menyediakan custom video mapping loops resolusi 4K untuk LED videotron panggung',
    ],
    description: 'Live electronic act memadukan synthethiser analog dengan bass drop menggelegar, dirancang khusus untuk sesi penutup festival konser.',
    managerContact: 'Neon Wave Agency (Kiki: 0819-2233-8899)',
    completedGigs: 43,
  },

  // SPONSORS
  {
    id: 'spo-1',
    name: 'Teh Segar Nusantara',
    type: 'SPONSOR',
    categoryLabel: 'F&B Beverage FMCG Brand',
    city: 'Jakarta Pusat',
    rating: 4.96,
    avatar: '/assets/sponsor-activation.jpg',
    priceRange: 'Komitmen Anggaran: Rp 50.000.000 - Rp 250.000.000',
    specsOrRiders: [
      'Target Demografi: Pelajar & Mahasiswa (Usia 16-25 Tahun)',
      'Kebutuhan Aktivasi: Booth Sampling 6x6m di dekat gerbang masuk utama',
      'Hak Eksklusif: Single exclusive beverage vendor di seluruh area acara',
      'Branding: Logo di wristband penonton, backdrop panggung, & Instagram feed EO',
    ],
    description: 'Brand minuman kemasan ternama yang aktif mensponsori festival musik anak muda, pensi SMA, dan pameran kuliner berskala minimal 3.000 pengunjung.',
    managerContact: 'Brand Activation Lead (Dewi: sponsorship@tehsegar.id)',
    completedGigs: 36,
  },
  {
    id: 'spo-2',
    name: 'FinGo Digital Bank',
    type: 'SPONSOR',
    categoryLabel: 'Fintech & Digital Banking',
    city: 'Jakarta Selatan',
    rating: 4.9,
    avatar: '/assets/sponsor-activation.jpg',
    priceRange: 'Komitmen Anggaran: Rp 75.000.000 - Rp 400.000.000',
    specsOrRiders: [
      'Target Demografi: First jobbers, mahasiswa, tech-savvy (Usia 18-35 Tahun)',
      'Kebutuhan Aktivasi: Exclusive Cashless Payment Partner (QRIS promo cashback)',
      'Booth Experience: Area instalasi interaktif 8x8m dengan photo booth AI & game berhadiah',
      'Metrics: Target minimum 1.500 akuisisi akun baru dan 10.000 transaksi QRIS di venue',
    ],
    description: 'Platform perbankan digital generasi baru dengan solusi pembayaran nontunai cepat, mencari event berkapasitas 5.000+ pengunjung berkarakter urban dinamis.',
    managerContact: 'Head of Partnerships (Bram: partnership@fingobank.co.id)',
    completedGigs: 28,
  },
];
