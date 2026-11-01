import { useState, useEffect, useRef } from 'react';
import useGsapReveal from '../hooks/useGsapReveal';
import {
  Building2,
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
  const [customBudget, setCustomBudget] = useState('');
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef);

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

  const ageBars = [
    { label: '18-24 tahun (mahasiswa dan pelajar)', pct: 54 },
    { label: '25-34 tahun (first jobber dan profesional)', pct: 33 },
    { label: '35+ tahun (keluarga muda)', pct: 13 },
  ];
  const interestBars = [
    { label: 'Musik, konser, dan festival', pct: 94 },
    { label: 'Kuliner dan specialty beverages', pct: 88 },
    { label: 'Fashion lokal dan sneakers', pct: 76 },
    { label: 'Teknologi, fintech, dan gadget', pct: 68 },
    { label: 'Travel dan lifestyle experiences', pct: 55 },
  ];

  const Bar = ({ label, pct }: { label: string; pct: number }) => (
    <div>
      <div className="mb-1.5 flex justify-between gap-3 text-sm font-medium text-slate-800">
        <span>{label}</span>
        <span className="font-display font-bold text-brand-ink">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2.5 w-full overflow-hidden rounded-full bg-brand-sand"
      >
        <div data-gsap-bar className="h-full rounded-full bg-brand-navy" style={{ width: pct + '%' }} />
      </div>
    </div>
  );

  const inputClass =
    'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30';

  return (
    <div ref={pageRef} className="space-y-16 font-sans sm:space-y-20">
      <SEOHead
        title="Sponsor Hub — Peluang Aktivasi Brand & Kemitraan Festival | Event Yuk"
        description="Hubungkan brand FMCG, fintech, dan korporasi dengan ratusan festival musik, pensi sekolah, dan bazaar di Indonesia. Akses demografi audiens riil, paket Title/Platinum/Gold/Silver, dan laporan ROI aktivasi transparan."
        keywords="sponsor pensi sekolah, sponsorship konser musik, paket aktivasi brand festival, proposal sponsorship jakarta, brand activation event"
        canonicalPath="/sponsors"
      />

      <header className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <Building2 aria-hidden="true" className="h-4 w-4" />
          Portal kemitraan sponsor brand
        </p>
        <h1 data-split-title className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink sm:text-6xl">
          Sponsor Hub
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Lihat profil audiens, pilih paket sponsorship, dan ajukan penawaran langsung ke penyelenggara dengan kontrak PKS dan termin pembayaran yang aman.
        </p>
      </header>

      <section aria-label="Ringkasan audiens" className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
        {[
          { label: 'Total ekosistem audiens', value: '450.000+', note: '+28% YoY peningkatan pengunjung aktif' },
          { label: 'Target usia dominan', value: '18-32 tahun', note: 'Gen-Z dan milenial produktif (SES A dan B 72%)' },
          { label: 'Total estimasi media impressions', value: '12,8 juta', note: 'Jangkauan media sosial dan aktivasi on-ground' },
        ].map((m) => (
          <div key={m.label} data-gsap-reveal className="rounded-lg bg-white p-6">
            <p className="text-sm font-medium text-slate-700">{m.label}</p>
            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-ink">{m.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{m.note}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div data-gsap-reveal className="rounded-lg bg-white p-6 sm:p-8 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
                Demografi dan minat pengunjung
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Data agregat dari pengunjung yang membeli tiket dan registrasi tenant
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-brand-forest-light px-3 py-1.5 text-sm font-semibold text-brand-forest-dark">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              Terverifikasi e-KYC
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-5">
              <h3 className="font-display text-lg font-bold text-brand-ink">Sebaran usia</h3>
              <div className="space-y-4">
                {ageBars.map((b) => (
                  <Bar key={b.label} {...b} />
                ))}
              </div>
              <dl className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg bg-brand-cream p-4 text-center">
                  <dt className="text-sm text-slate-700">Wanita</dt>
                  <dd className="font-display text-2xl font-extrabold text-brand-ink">58%</dd>
                </div>
                <div className="rounded-lg bg-brand-cream p-4 text-center">
                  <dt className="text-sm text-slate-700">Pria</dt>
                  <dd className="font-display text-2xl font-extrabold text-brand-ink">42%</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-5">
              <h3 className="font-display text-lg font-bold text-brand-ink">Minat teratas</h3>
              <div className="space-y-4">
                {interestBars.map((b) => (
                  <Bar key={b.label} {...b} />
                ))}
              </div>
              <div className="rounded-lg bg-brand-lime-soft p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                  Daya beli rata-rata di venue
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Pengeluaran pengunjung berkisar antara Rp 120.000 dan Rp 350.000 per hari untuk F&amp;B dan merchandise.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div data-gsap-reveal className="flex flex-col justify-between rounded-lg bg-white p-6 sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
              Pilih acara untuk disponsori
            </h2>
            <p className="mt-1 text-sm text-slate-600">Acara yang sedang membuka slot sponsorship</p>

            <ul className="mt-5 space-y-3">
              {availableEvents.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    aria-pressed={selectedEvent.id === ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                      selectedEvent.id === ev.id
                        ? 'border-brand-navy bg-brand-lime-soft'
                        : 'border-slate-200 hover:border-brand-navy/50'
                    }`}
                  >
                    <img
                      src={ev.bannerImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 shrink-0 rounded-md bg-brand-navy-light object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-brand-ink">{ev.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar aria-hidden="true" className="h-4 w-4 shrink-0" />
                        {ev.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-lg bg-brand-cream p-4">
            <p className="text-sm text-slate-700">Penyelenggara terpilih</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-display text-lg font-extrabold text-brand-ink">
              {selectedEvent.organizer.name}
              <CheckCircle2 aria-label="Terverifikasi" className="h-5 w-5 text-brand-forest" />
            </p>
            <p className="mt-1 text-sm text-slate-600">Target pengunjung 15.000+ orang, skema pembayaran PKS resmi</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="sponsor-tiers-title">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="sponsor-tiers-title"
            data-split-title
            className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-brand-ink sm:text-5xl"
          >
            Pilih paket sponsorship
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Semua paket dilindungi kontrak PKS digital dan termin escrow (50:50 atau 70:30).
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {sponsorshipTiers.map((tier) => {
            const selected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                data-gsap-reveal
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onClick={() => setSelectedTier(tier.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTier(tier.id);
                  }
                }}
                className={`flex cursor-pointer flex-col justify-between rounded-lg border-2 p-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy ${
                  selected ? 'border-brand-navy bg-brand-lime' : 'border-transparent bg-white hover:border-brand-navy/40'
                }`}
              >
                <div>
                  <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
                    {tier.badge}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-extrabold leading-tight tracking-[-0.03em] text-brand-ink">
                    {tier.name}
                  </h3>
                  <p className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
                    {tier.price}
                  </p>

                  <div className="mt-5 border-t border-brand-navy/15 pt-5">
                    <p className="text-sm font-semibold text-brand-ink">Benefit dan deliverables</p>
                    <ul className="mt-3 space-y-2.5">
                      {tier.deliverables.map((deliv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm leading-6 text-slate-800">
                          <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-forest" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className={`mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold ${
                    selected ? 'bg-brand-navy text-white' : 'bg-brand-cream text-brand-ink'
                  }`}
                >
                  {selected ? 'Paket terpilih' : 'Pilih paket ini'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sponsor-form-title" data-gsap-reveal className="rounded-lg bg-white p-6 sm:p-10">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
            <Send aria-hidden="true" className="h-4 w-4" />
            Pengajuan langsung ke penyelenggara
          </p>
          <h2
            id="sponsor-form-title"
            className="font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-ink sm:text-4xl"
          >
            Kirim pengajuan sponsorship
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Kamu mengajukan sponsorship untuk <strong className="text-brand-ink">{selectedEvent.title}</strong> dengan paket{' '}
            <strong className="text-brand-ink">{selectedTier}</strong>. Termin pembayaran (50:50 atau 70:30) bisa kamu negosiasikan bersama EO.
          </p>
        </div>

        {proposalSubmitted ? (
          <div role="status" className="mt-8 rounded-lg bg-brand-forest-light p-8 text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto mb-3 h-10 w-10 text-brand-forest" />
            <p className="font-display text-xl font-extrabold text-brand-forest-dark">Proposal sponsorship terkirim</p>
            <p className="mx-auto mt-2 max-w-md text-base leading-7 text-slate-700">
              Event Organizer akan menerima notifikasi penawaran ini. Kamu bisa memantau status persetujuan, mengajukan penyesuaian harga, atau menandatangani PKS di tab Kontrak.
            </p>
          </div>
        ) : (
          <form onSubmit={handleProposalSubmit} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="sponsor-brand" className="mb-2 block text-sm font-semibold text-slate-800">
                Nama perusahaan atau brand
              </label>
              <input
                id="sponsor-brand"
                type="text"
                required
                placeholder="Contoh: PT Sumber Minuman Segar"
                value={customBrandName}
                onChange={(e) => setCustomBrandName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sponsor-budget" className="mb-2 block text-sm font-semibold text-slate-800">
                Nominal komitmen anggaran (Rp)
              </label>
              <input
                id="sponsor-budget"
                type="number"
                required
                min={0}
                inputMode="numeric"
                placeholder="Contoh: 150000000"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sponsor-notes" className="mb-2 block text-sm font-semibold text-slate-800">
                Kebutuhan khusus atau hak aktivasi brand
              </label>
              <textarea
                id="sponsor-notes"
                rows={4}
                placeholder="Contoh: Kami memerlukan hak eksklusif penjualan minuman non-alkohol di 3 zona panggung dan 1 spot photobooth berukuran 6x6 meter."
                className={inputClass + ' py-3'}
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-forest" />
                Dilindungi rekening bersama Escrow dan kontrak MoU resmi
              </p>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-navy px-7 text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
              >
                <Send aria-hidden="true" className="h-5 w-5" />
                Kirim proposal
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
