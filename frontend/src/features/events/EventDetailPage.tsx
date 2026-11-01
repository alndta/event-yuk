import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Music,
  Store,
  Users,
  Building2,
  ArrowRight,
  Clock,
  Briefcase,
  X,
} from 'lucide-react';
import { initialEvents, EventItem } from '../../data/mockEvents';
import { useAuth } from '../../context/AuthContext';
import { SEOHead } from '../../components/SEOHead';
import { DetailSkeleton } from '../../components/skeletons/DetailSkeleton';
import { cachedFetch } from '../../utils/apiCache';
import useGsapReveal from '../../hooks/useGsapReveal';
import Avatar from '../../components/Avatar';
import { categoryLabels } from '../../components/events/EventCardLive';

interface Props {
  events?: EventItem[];
  onOpenProposal: (event: EventItem, roleType: 'VENDOR' | 'TALENT' | 'SPONSOR') => void;
}

export default function EventDetailPage({ events: propEvents, onOpenProposal }: Props) {
  const { id } = useParams();
  const { user, requireAuth } = useAuth();
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef);

  const fallbackEvent = (propEvents || initialEvents).find((e) => e.id === id) || initialEvents[0];
  const [event, setEvent] = useState<any>(fallbackEvent);
  const [booths, setBooths] = useState<any[]>([]);
  const [crewShifts, setCrewShifts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'booths' | 'crew' | 'sponsorship'>('overview');

  // Interactive Booth registration modal
  const [selectedBooth, setSelectedBooth] = useState<any | null>(null);
  const [boothBrandName, setBoothBrandName] = useState('');
  const [submittingBooth, setSubmittingBooth] = useState(false);

  // Success Feedback
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    cachedFetch(`/api/v1/events/${id}`)
      .then((resData: any) => {
        if (resData.success && resData.data) {
          const d = resData.data;
          setEvent({
            id: d.id,
            title: d.title,
            category: d.event_category,
            organizer: {
              name: d.organizer?.full_name || 'Nusantara Live Kreasi',
              avatar: '/assets/crew-production.jpg',
              verified: d.organizer?.kyc_status === 'VERIFIED',
              city: 'Jakarta',
            },
            venue: d.venue_name,
            date: d.start_date
              ? new Date(d.start_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'TBA',
            totalBudget: d.total_budget,
            description: d.description,
            bannerImage: d.banner_image || '/assets/hero-concert.jpg',
            isPortfolio: Boolean(d.is_portfolio),
          });

          if (Array.isArray(d.tenant_booths)) {
            setBooths(d.tenant_booths);
          }
          if (Array.isArray(d.crew_shifts)) {
            setCrewShifts(d.crew_shifts);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleRegisterBooth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooth) return;

    requireAuth(async () => {
      setSubmittingBooth(true);
      try {
        const res = await fetch(`/api/v1/events/${event.id}/booths/${selectedBooth.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_user_id: user?.id || 'a0000000-0000-0000-0000-000000000004',
            brand_name: boothBrandName || 'Tenant Brand Baru',
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification(`Pendaftaran kaveling booth ${selectedBooth.booth_code} berhasil diajukan untuk kurasi!`);
        } else {
          showNotification(json.error || 'Pendaftaran kaveling booth diproses.');
        }
      } catch {
        showNotification(`Pendaftaran kaveling booth ${selectedBooth.booth_code} berhasil diajukan!`);
      } finally {
        setSubmittingBooth(false);
        setSelectedBooth(null);
        setBoothBrandName('');
      }
    }, 'Silakan masuk ke akun Tenant Anda untuk mendaftar kaveling booth.');
  };

  const handleApplyShift = (shift: any) => {
    requireAuth(async () => {
      try {
        const res = await fetch(`/api/v1/events/${event.id}/shifts/${shift.id}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crew_user_id: user?.id || 'a0000000-0000-0000-0000-000000000006',
          }),
        });
        const json = await res.json();
        if (json.success) {
          showNotification(`Lamaran posisi kru ${shift.role_title} berhasil dikirim ke koordinator EO!`);
        } else {
          showNotification(json.error || 'Lamaran shift kru diproses.');
        }
      } catch {
        showNotification(`Lamaran posisi kru ${shift.role_title} berhasil diajukan!`);
      }
    }, `Silakan masuk ke akun Kru Lapangan untuk melamar shift ${shift.role_title}.`);
  };

  const displayBooths = booths.length > 0 ? booths : [
    { id: 'bth-1', booth_code: 'FNB-01', booth_category: 'FNB', size_dimension: '3x3m', rental_price: 7500000, is_occupied: false },
    { id: 'bth-2', booth_code: 'FNB-02', booth_category: 'FNB', size_dimension: '3x3m', rental_price: 7500000, is_occupied: false },
    { id: 'bth-3', booth_code: 'FASHION-01', booth_category: 'FASHION', size_dimension: '3x3m', rental_price: 6000000, is_occupied: false },
    { id: 'bth-4', booth_code: 'SPONSOR-A', booth_category: 'SPONSOR', size_dimension: '6x6m', rental_price: 25000000, is_occupied: false },
  ];

  const displayShifts = crewShifts.length > 0 ? crewShifts : [
    { id: 'shf-1', role_title: 'LO', shift_date: '2027-05-15', headcount_req: 8, rate_per_shift: 350000 },
    { id: 'shf-2', role_title: 'USHER', shift_date: '2027-05-15', headcount_req: 12, rate_per_shift: 300000 },
    { id: 'shf-3', role_title: 'STAGEHAND', shift_date: '2027-05-15', headcount_req: 6, rate_per_shift: 400000 },
  ];

  const eventSchema = event
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        startDate: event.date,
        eventStatus: event.isPortfolio
          ? 'https://schema.org/EventMovedOnline'
          : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: event.venue,
          address: {
            '@type': 'PostalAddress',
            addressLocality: event.organizer?.city || 'Jakarta',
            addressCountry: 'ID',
          },
        },
        image: [event.bannerImage],
        description: event.description || `Informasi acara ${event.title} di ${event.venue}.`,
        organizer: {
          '@type': 'Organization',
          name: event.organizer?.name || 'Penyelenggara Acara',
        },
      }
    : undefined;

  if (loading && !event) {
    return <DetailSkeleton />;
  }

  return (
    <div ref={pageRef} className="space-y-8 pb-12 font-sans sm:space-y-10">
      <SEOHead
        title={`${event?.title || 'Detail Acara'} — Peluang Kerjasama & Pengadaan | Event Yuk`}
        description={
          event?.description
            ? `${event.description.slice(0, 150)}... Sewa booth, penawaran vendor, dan kru di ${event.venue}.`
            : `Informasi detail acara ${event?.title || ''}, jadwal produksi, kaveling booth tenant, dan rekrutmen kru.`
        }
        keywords={`${event?.title || 'acara'}, pengadaan vendor ${event?.title || ''}, sewa booth tenant, lowongan kru ${event?.venue || ''}, escrow midtrans`}
        canonicalPath={`/events/${event?.id || id}`}
        ogImage={event?.bannerImage}
        schemaJson={eventSchema}
      />

      {/* Toast Alert */}
      {feedbackToast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-brand-ink px-5 py-3.5 text-sm text-white shadow-2xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Banner Hero */}
      <section data-gsap-reveal aria-labelledby="event-detail-title" className="relative overflow-hidden rounded-lg bg-brand-ink">
        <div className="relative min-h-[400px] sm:min-h-[480px]">
          <img
            src={event.bannerImage || '/assets/hero-concert.jpg'}
            alt={event.title}
            width={1600}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-85"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/45 to-brand-ink/10" />

          <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={'inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-white shadow-sm ' + (event.isPortfolio ? 'bg-slate-700' : 'bg-brand-navy')}>
                <span aria-hidden="true" className={'h-2 w-2 rounded-full ' + (event.isPortfolio ? 'bg-slate-300' : 'bg-emerald-200')} />
                {event.isPortfolio ? 'Sudah terlaksana' : 'Membuka kolaborasi'}
              </span>
              <span className="inline-flex min-h-9 items-center rounded-full bg-white/95 px-3.5 text-sm font-semibold text-slate-900 shadow-sm">
                {categoryLabels[event.category]?.label ?? event.category}
              </span>
            </div>
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/30 bg-brand-ink/60 px-3.5 text-sm font-semibold text-white backdrop-blur">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-lime" />
              Pembayaran via Escrow Midtrans
            </span>
          </div>

          <div className="absolute inset-x-5 bottom-6 text-white sm:inset-x-8 sm:bottom-8">
            <p className="text-sm font-semibold text-brand-lime">Detail acara</p>
            <h1 id="event-detail-title" className="mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-lime" /> {event.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-forest" /> {event.venue}
              </span>
              {event.totalBudget !== undefined && event.totalBudget !== null && (
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-300" />
                  Pagu yang dicantumkan: Rp {Number(event.totalBudget).toLocaleString('id-ID')}
                </span>
              )}
              <Link
                to="/events"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Kembali ke acara
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Detail + Action Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Organizer Box */}
          <div data-gsap-reveal className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar
                src={event.organizer?.avatar}
                name={event.organizer?.name || 'Promotor'}
                decorative
                className="h-12 w-12 rounded-full"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <span>{event.organizer?.name || 'Promotor Event Yuk'}</span>
                  {event.organizer?.verified && <CheckCircle2 aria-label="Organizer terverifikasi" className="h-4 w-4 text-brand-navy" />}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {event.organizer?.city || 'Jakarta'}{event.organizer?.verified ? ' · Organizer terverifikasi' : ' · Penyelenggara acara'}
                </div>
              </div>
            </div>

            <Link
              to="/organizers"
              className="inline-flex min-h-10 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-navy/40 hover:bg-brand-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              Lihat rekam jejak
            </Link>
          </div>

          {/* Sub Navigation Tabs */}
          <div role="group" aria-label="Bagian informasi acara" className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              aria-pressed={activeTab === 'overview'}
              className={`min-h-11 shrink-0 rounded-full px-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                activeTab === 'overview' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              Ikhtisar dan kebutuhan
            </button>
            <button
              onClick={() => setActiveTab('booths')}
              aria-pressed={activeTab === 'booths'}
              className={`min-h-11 shrink-0 rounded-full px-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                activeTab === 'booths' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              Denah kaveling booth ({displayBooths.length} Unit)
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              aria-pressed={activeTab === 'crew'}
              className={`min-h-11 shrink-0 rounded-full px-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                activeTab === 'crew' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              Lowongan kru shift ({displayShifts.length} Posisi)
            </button>
            <button
              onClick={() => setActiveTab('sponsorship')}
              aria-pressed={activeTab === 'sponsorship'}
              className={`min-h-11 shrink-0 rounded-full px-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                activeTab === 'sponsorship' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              Paket sponsorship
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div data-gsap-reveal className="space-y-5 rounded-lg bg-white p-6 sm:p-8">
              <div>
                <p className="text-sm font-semibold text-brand-lime-strong">Tentang acara</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.025em] text-slate-950">Ikhtisar acara</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  {event.description || 'Penyelenggara belum menambahkan deskripsi untuk acara ini.'}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-900">Jelajahi peluang kolaborasi</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Pilih jalur yang sesuai dengan layanan atau minatmu.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button onClick={() => onOpenProposal(event, 'VENDOR')} className="group flex min-h-[84px] items-center gap-3 rounded-lg bg-brand-cream p-4 text-left transition hover:bg-brand-lime-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy"><Sliders aria-hidden="true" className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block text-sm font-bold text-slate-900">Layanan vendor</span><span className="mt-1 block text-sm leading-5 text-slate-500">Kirim penawaran kebutuhan produksi</span></span>
                    <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-navy" />
                  </button>
                  <button onClick={() => onOpenProposal(event, 'TALENT')} className="group flex min-h-[84px] items-center gap-3 rounded-lg bg-brand-cream p-4 text-left transition hover:bg-brand-lime-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-forest/10 text-brand-forest"><Music aria-hidden="true" className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block text-sm font-bold text-slate-900">Talent & performer</span><span className="mt-1 block text-sm leading-5 text-slate-500">Ajukan profil atau proposal tampil</span></span>
                    <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-navy" />
                  </button>
                  <button onClick={() => setActiveTab('booths')} className="group flex min-h-[84px] items-center gap-3 rounded-lg bg-brand-cream p-4 text-left transition hover:bg-brand-lime-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lime/15 text-amber-800"><Store aria-hidden="true" className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block text-sm font-bold text-slate-900">Tenant & booth</span><span className="mt-1 block text-sm leading-5 text-slate-500">Lihat kaveling yang tersedia</span></span>
                    <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-navy" />
                  </button>
                  <button onClick={() => setActiveTab('crew')} className="group flex min-h-[84px] items-center gap-3 rounded-lg bg-brand-cream p-4 text-left transition hover:bg-brand-lime-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Users aria-hidden="true" className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block text-sm font-bold text-slate-900">Crew acara</span><span className="mt-1 block text-sm leading-5 text-slate-500">Lihat posisi dan jadwal shift</span></span>
                    <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-navy" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Booths */}
          {activeTab === 'booths' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-brand-lime-soft p-5 text-sm">
                <div className="mb-1 flex items-center gap-2 font-bold text-slate-900">
                  <Store aria-hidden="true" className="h-4 w-4 text-brand-navy" />
                  <span>Kaveling Booth Pameran & Bazaar Kuliner</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Lihat detail ukuran dan biaya setiap kaveling. Pendaftaran akan diteruskan ke penyelenggara untuk ditinjau.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayBooths.map((booth) => (
                  <div key={booth.id} className="flex flex-col justify-between space-y-4 rounded-lg bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-slate-100 text-slate-800 font-mono">
                          {booth.booth_code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${booth.is_occupied ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {booth.is_occupied ? 'Terisi' : 'Tersedia'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">Kategori: {booth.booth_category}</div>
                      <div className="text-sm text-slate-500">Ukuran: {booth.size_dimension || '3x3 meter'}</div>
                      <div className="text-base font-extrabold text-slate-900 font-mono mt-2">
                        Rp {Number(booth.rental_price).toLocaleString('id-ID')}
                      </div>
                    </div>

                    {!booth.is_occupied && (
                      <button
                        onClick={() => setSelectedBooth(booth)}
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-navy px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                      >
                        Daftar Sewa Kaveling Ini
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Crew Shifts */}
          {activeTab === 'crew' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-brand-lime-soft p-5 text-sm">
                <div className="mb-1 flex items-center gap-2 font-bold text-slate-900">
                  <Briefcase aria-hidden="true" className="h-4 w-4 text-amber-800" />
                  <span>Papan Rekrutmen Kru Shift Acara</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Tinjau peran, jadwal, dan honor sebelum mengirim lamaran. Detail berikut mengikuti informasi yang dicantumkan penyelenggara.
                </p>
              </div>

              <div className="space-y-3">
                {displayShifts.map((shift) => (
                  <div key={shift.id} className="flex flex-col justify-between gap-4 rounded-lg bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                        <span>{shift.role_title === 'LO' ? 'Liaison Officer (LO) Artis' : shift.role_title === 'USHER' ? 'Usher & Tiketing Pintu Masuk' : shift.role_title === 'STAGEHAND' ? 'Stagehand & Kru Lapangan' : shift.role_title}</span>
                        <span className="rounded-full bg-brand-lime/20 px-2.5 py-1 text-sm font-semibold text-amber-900">
                          {shift.role_title}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock aria-hidden="true" className="h-3.5 w-3.5" /> Shift acara: {shift.shift_date}</span>
                        <span className="flex items-center gap-1.5"><Users aria-hidden="true" className="h-3.5 w-3.5" /> Kuota: {shift.headcount_req} personil</span>
                      </div>
                      <div className="mt-3 text-sm font-bold text-slate-900">
                        Honor <span className="font-display">Rp {Number(shift.rate_per_shift).toLocaleString('id-ID')}</span><span className="font-normal text-slate-500"> / shift</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyShift(shift)}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand-ink px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                    >
                      Lamar Shift Ini
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Sponsorship Packages */}
          {activeTab === 'sponsorship' && (
            <div className="space-y-4">
              <div data-gsap-reveal className="rounded-lg bg-white p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-navy/10 px-3 py-1.5 text-sm font-semibold text-brand-navy">
                  <Building2 aria-hidden="true" className="h-4 w-4" /> Kemitraan brand
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.025em] text-slate-950">Diskusikan sponsorship acara</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  Informasi paket belum dicantumkan. Kirim proposal untuk membahas kebutuhan brand, bentuk eksposur, dan ruang lingkup kemitraan langsung dengan penyelenggara.
                </p>
                <button
                  onClick={() => onOpenProposal(event, 'SPONSOR')}
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-forest px-6 text-sm font-semibold text-white transition hover:bg-brand-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest"
                >
                  Ajukan proposal sponsorship <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div data-gsap-reveal className="space-y-4 rounded-lg bg-white p-6">
            <div>
              <p className="text-sm font-semibold text-brand-lime-strong">Peluang kolaborasi</p>
              <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.02em] text-slate-950">Terlibat di acara ini</h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Pilih jenis kolaborasi untuk mengirim penawaran atau melihat detail peluang yang tersedia.
            </p>

            <button
              onClick={() => onOpenProposal(event, 'VENDOR')}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full bg-brand-navy px-5 text-left text-sm font-semibold text-white transition hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <div className="flex items-center gap-2">
                <Sliders aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>Ajukan penawaran vendor</span>
              </div>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </button>

            <button
              onClick={() => onOpenProposal(event, 'TALENT')}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full border-2 border-brand-navy/25 bg-transparent px-5 text-left text-sm font-semibold text-brand-ink transition hover:border-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <div className="flex items-center gap-2">
                <Music aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-forest" />
                <span>Ajukan proposal talent</span>
              </div>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('booths')}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full border-2 border-brand-navy/25 bg-transparent px-5 text-left text-sm font-semibold text-brand-ink transition hover:border-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <div className="flex items-center gap-2">
                <Store aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-navy" />
                <span>Lihat kaveling booth</span>
              </div>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('crew')}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full border-2 border-brand-navy/25 bg-transparent px-5 text-left text-sm font-semibold text-brand-ink transition hover:border-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <div className="flex items-center gap-2">
                <Users aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-800" />
                <span>Lihat posisi crew</span>
              </div>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Booth Registration */}
      {selectedBooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="booth-dialog-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="booth-dialog-title" className="font-display text-lg font-bold tracking-[-0.02em] text-slate-950">
                Pendaftaran Kaveling Booth: {selectedBooth.booth_code}
              </h2>
              <button
                onClick={() => setSelectedBooth(null)}
                aria-label="Tutup dialog pendaftaran"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterBooth} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Nama Brand / Usaha Tenant
                </label>
                <input
                  type="text"
                  required
                    autoFocus
                  placeholder="Misal: Kopi Kenangan / Sambal Nusantara"
                  value={boothBrandName}
                  onChange={(e) => setBoothBrandName(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori Booth:</span>
                  <span className="font-bold text-slate-900">{selectedBooth.booth_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ukuran Kaveling:</span>
                  <span className="font-bold text-slate-900">{selectedBooth.size_dimension || '3x3m'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Biaya Sewa:</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    Rp {Number(selectedBooth.rental_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooth(null)}
                  className="min-h-11 flex-1 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingBooth}
                  className="min-h-11 flex-1 rounded-full bg-brand-navy px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingBooth ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
