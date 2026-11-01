import { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  CheckCircle2,
  Send,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { initialEvents, EventItem } from '../data/mockEvents';
import { SEOHead } from '../components/SEOHead';

interface Props {
  events?: EventItem[];
  onApplySponsorship?: (event: EventItem, tier: string, budget: string) => void;
}

export default function SponsorHubPage({ events, onApplySponsorship }: Props) {
  const availableEvents = (events && events.length > 0 ? events : initialEvents).filter(e => !e.isPortfolio);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(availableEvents[0] || initialEvents[0]);
  const [selectedTier, setSelectedTier] = useState<string>('PLATINUM');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customBudget, setCustomBudget] = useState('150000000');
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  useEffect(() => {
    if (availableEvents.length > 0) {
      setSelectedEvent(availableEvents[0]);
    }
  }, [events]);

  const sponsorshipTiers = [
    {
      id: 'TITLE',
      name: 'Title Naming Rights Sponsor',
      price: 'Rp 350.000.000',
      badge: 'Eksklusif (1 Brand Saja)',
      deliverables: [
        'Hak Penamaan Resmi Acara (e.g. Brand Name presents Soundfest)',
        'Area Aktivasi Utama Megabooth 10x10 meter di depan Gate 1',
        'Logo Utama di Semua Materi Promosi (Billboard, Poster, Tiket, ID Card, Wristband)',
        'Logo Rotasi LED Screen Panggung Utama (Setiap 5 menit)',
        'Akses VIP Hospitality Lounge (30 Tiket Terusan)',
        'Hak Eksklusif Penjualan / Sampling di Seluruh Area Festival',
        'Laporan Lengkap Audit Pasca-Acara (Demografi Pengunjung & Impressions)',
      ],
      color: 'border-[#5E7628] bg-gradient-to-b from-[#5E7628]/5 to-transparent',
    },
    {
      id: 'PLATINUM',
      name: 'Platinum Co-Host Partner',
      price: 'Rp 175.000.000',
      badge: 'Terbatas (2 Slot)',
      deliverables: [
        'Logo Sekunder di Panggung Utama dan Backdrop Press Conference',
        'Area Kaveling Booth Eksperiensial 6x6 meter (Listrik 10.000 Watt)',
        'Branding Digital di 15 Feed & Story Akun Resmi Penyelenggara',
        'Hak Pembagian Sampel Produk (Sampling Rights) di Area Pintu Masuk',
        '15 Tiket VIP Pass & Undangan Khusus Gala Dinner',
        'Laporan Dokumentasi Foto & Video Resolusi 4K untuk Materi PR Brand',
      ],
      color: 'border-[#172D46] bg-gradient-to-b from-[#172D46]/5 to-transparent',
    },
    {
      id: 'GOLD',
      name: 'Gold Stage & Zone Sponsor',
      price: 'Rp 85.000.000',
      badge: 'Tersedia (4 Slot)',
      deliverables: [
        'Penamaan Zona Khusus (e.g. Stage 2 atau Food Carnival Zone)',
        'Area Kaveling Booth Interaktif 4x4 meter',
        'Logo di Layout Peta Denah Acara dan Buku Panduan Pengunjung',
        'Branding di 8 Postingan Media Sosial Resmi',
        '8 Tiket VIP Pass',
        'Penyebutan Ad-Lib oleh MC sebanyak 6 kali per hari acara',
      ],
      color: 'border-[#5E7628] bg-gradient-to-b from-[#5E7628]/5 to-transparent',
    },
    {
      id: 'SILVER',
      name: 'Silver Community Supporter',
      price: 'Rp 40.000.000',
      badge: 'Tersedia (6 Slot)',
      deliverables: [
        'Area Booth Standar 3x3 meter',
        'Logo Bersama di Spanduk Gerbang Masuk & Banner Acara',
        'Branding di 4 Postingan Media Sosial Bersama',
        '4 Tiket Regular Pass',
        'Penyebutan Ad-Lib oleh MC 2 kali per hari acara',
      ],
      color: 'border-slate-300 bg-white',
    },
  ];

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onApplySponsorship) {
      onApplySponsorship(selectedEvent, selectedTier, customBudget);
    }
    setProposalSubmitted(true);
    setTimeout(() => setProposalSubmitted(false), 5000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Sponsor Hub — Peluang Aktivasi Brand & Kemitraan Festival | Event Yuk"
        description="Hubungkan brand FMCG, fintech, dan korporasi dengan ratusan festival musik, pensi sekolah, dan bazaar di Indonesia. Akses demografi audiens riil, paket Title/Platinum/Gold/Silver, dan laporan ROI aktivasi transparan."
        keywords="sponsor pensi sekolah, sponsorship konser musik, paket aktivasi brand festival, proposal sponsorship jakarta, brand activation event"
        canonicalPath="/sponsors"
      />

      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-3 border border-amber-200">
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Portal Intelijen & Kemitraan Sponsor Brand</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sponsor Intelligence Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Akses data demografi riil pengunjung, profil audiens, kalkulasi ROI impresi, dan pilih paket sponsorship resmi dengan kepastian kontrak PKS dan termin aman.
        </p>
      </div>

      {/* 3 Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ekosistem Audiens</span>
            <div className="p-2.5 rounded-2xl bg-sky-50 text-[#172D46]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">450.000+</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">+28% YoY</span>
            <span>peningkatan pengunjung aktif</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Usia Dominan</span>
            <div className="p-2.5 rounded-2xl bg-orange-50 text-[#5E7628]">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">18 - 32 Thn</div>
          <div className="text-xs text-slate-500 mt-1">
            Gen-Z & Milenial Produktif (SES A & B 72%)
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Est. Media Impressions</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">12.8 Juta</div>
          <div className="text-xs text-slate-500 mt-1">
            Jangkauan media sosial & aktivasi on-ground
          </div>
        </div>
      </div>

      {/* Demographic Breakdown & Event Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left: Demographics Chart & Audience Insights */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">Demografi & Profil Minat Pengunjung Acara</h2>
              <p className="text-xs text-slate-500">Data agregat dari pengunjung yang membeli tiket dan registrasi tenant</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#172D46] text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5E7628]" />
              <span>Data Terverifikasi e-KYC</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {/* Usia & Gender */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Sebaran Kelompok Usia</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>18 - 24 Tahun (Mahasiswa & Pelajar)</span>
                    <span className="text-[#172D46]">54%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#172D46] h-full rounded-full" style={{ width: '54%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>25 - 34 Tahun (First Jobber & Profesional)</span>
                    <span className="text-[#456B39]">33%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#456B39] h-full rounded-full" style={{ width: '33%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>35+ Tahun (Keluarga Muda)</span>
                    <span className="text-[#5E7628]">13%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#5E7628] h-full rounded-full" style={{ width: '13%' }} />
                  </div>
                </div>
              </div>

              {/* Gender Split */}
              <div className="pt-2">
                <div className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Rasio Gender</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-xs text-slate-500 font-semibold">Wanita</div>
                    <div className="text-lg font-black text-[#456B39]">58%</div>
                  </div>
                  <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-xs text-slate-500 font-semibold">Pria</div>
                    <div className="text-lg font-black text-[#172D46]">42%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Consumer Interests */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Kategori Minat Teratas (Affinity)</h3>
              <div className="space-y-2">
                {[
                  { name: 'Musik Konser & Festival', pct: 94, color: 'bg-purple-600' },
                  { name: 'Kuliner & Specialty Beverages', pct: 88, color: 'bg-[#5E7628]' },
                  { name: 'Fashion Lokal & Sneakers', pct: 76, color: 'bg-emerald-600' },
                  { name: 'Teknologi, Fintech & Gadgets', pct: 68, color: 'bg-[#172D46]' },
                  { name: 'Travel & Lifestyle Experiences', pct: 55, color: 'bg-indigo-600' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{item.name}</span>
                      <span className="font-mono text-slate-900">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Buying Power */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 mt-3">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Daya Beli Rata-Rata di Venue (Basket Size)</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Rata-rata pengeluaran pengunjung berkisar antara Rp 120.000 - Rp 350.000 per hari untuk F&B dan merchandise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Select Event to Sponsor */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Pilih Acara untuk Disponsori</h2>
            <p className="text-xs text-slate-500 mt-1">Acara yang saat ini membuka slot sponsorship terbuka</p>

            <div className="mt-4 space-y-3">
              {availableEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                    selectedEvent.id === ev.id
                      ? 'border-[#172D46] bg-[#172D46]/5 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={ev.bannerImage}
                    alt={ev.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{ev.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#5E7628]" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#456B39]" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Penyelenggara Terpilih:</div>
            <div className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span>{selectedEvent.organizer.name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Target Pengunjung: 15.000+ Orang • Skema Pembayaran PKS Resmi
            </div>
          </div>
        </div>
      </div>

      {/* Sponsorship Tier Cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Pilihan Paket Sponsorship & Hak Istimewa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Semua paket dilindungi kontrak PKS digital & termin escrow aman (50:50 atau 70:30)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsorshipTiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition cursor-pointer relative shadow-sm hover:shadow-md ${
                selectedTier === tier.id
                  ? `${tier.color} ring-2 ring-[#172D46] shadow-md`
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#172D46] text-white mb-3">
                  {tier.badge}
                </span>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {tier.name}
                </h3>
                <div className="text-lg font-black text-[#172D46] mt-2 font-mono">
                  {tier.price}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Benefit & Deliverables:</div>
                  {tier.deliverables.map((deliv, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedTier === tier.id
                    ? 'bg-[#172D46] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{selectedTier === tier.id ? 'Paket Terpilih' : 'Pilih Paket Ini'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Proposal Submission Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Formulir Pengajuan Kemitraan Langsung ke EO</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Kirim Pengajuan Sponsorship ke Penyelenggara
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ajukan nominal sponsorship untuk acara <strong className="text-slate-900">{selectedEvent.title}</strong> dengan paket pilihan <strong className="text-slate-900">{selectedTier}</strong>. Anda dapat menegosiasikan termin pembayaran (50:50 atau 70:30) bersama EO.
          </p>
        </div>

        {proposalSubmitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <div className="text-base font-black text-emerald-900">Proposal Sponsorship Berhasil Dikirim!</div>
            <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
              Event Organizer akan menerima notifikasi penawaran ini. Anda dapat memantau status persetujuan, mengajukan penyesuaian harga, atau menandatangani PKS di tab Kontrak.
            </p>
          </div>
        ) : (
          <form onSubmit={handleProposalSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Perusahaan / Brand Sponsor
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Sumber Minuman Segar / Brand Teh"
                value={customBrandName}
                onChange={(e) => setCustomBrandName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#172D46] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nominal Komitmen Anggaran (Rp)
              </label>
              <input
                type="number"
                required
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-[#172D46] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kebutuhan Khusus / Permintaan Hak Aktivasi Brand
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Kami memerlukan hak eksklusif penjualan minuman non-alkohol di 3 zona panggung dan 1 spot photobooth berukuran 6x6 meter."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                defaultValue="Kami tertarik menjadi mitra resmi dan mengajukan termin pembayaran 50% saat PKS ditandatangani dan 50% setelah penyerahan laporan dokumentasi aktivasi pasca-acara."
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Terlindungi Rekening Bersama Escrow & Kontrak MoU Resmi</span>
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs font-bold bg-[#456B39] hover:bg-[#2F5232] text-white flex items-center gap-2 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Proposal Kemitraan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
