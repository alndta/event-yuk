import { useState, useEffect, useRef } from 'react';
import useGsapReveal from '../hooks/useGsapReveal';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { OrganizerItem } from '../types/models';
import { PartnerCardsSkeletonList } from '../components/skeletons/PartnerCardSkeleton';
import { SEOHead } from '../components/SEOHead';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { api, query } from '../lib/api';
import useDebounced from '../hooks/useDebounced';
import Avatar from '../components/Avatar';

interface Props {
  onInviteOrganizer?: (organizer: OrganizerItem) => void;
}

export default function SearchOrganizersPage({ onInviteOrganizer: _onInviteOrganizer }: Props) {
  const { t, language } = useLanguage();
  const [organizers, setOrganizers] = useState<OrganizerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, '[data-gsap-reveal]', [loading]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const debouncedSearch = useDebounced(searchTerm.trim(), 300);
  const cityFilter = selectedCity === 'ALL' ? undefined : selectedCity;

  // Search runs on the server. Without a running server, development builds fall back to the bundled samples.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api('/partners' + query({ type: 'EO', q: debouncedSearch, city: cityFilter }), { anonymous: true, signal: controller.signal })
      .then((resData) => setOrganizers((resData.data || []).map((eo: any): OrganizerItem => ({
          id: eo.id,
          name: eo.name,
          category: 'CONCERT',
          city: eo.city || '',
          avatar: eo.avatar || '/assets/crowd-festival.jpg',
          bannerImage: '/assets/hero-concert.jpg',
          rating: eo.rating || 0,
          totalEventsCompleted: eo.completedGigs || 0,
          totalAttendeesServed: '',
          verified: Boolean(eo.verified),
          specialties: [],
          description: eo.description || '',
          contactEmail: '',
          phone: '',
          pastHighlightEvents: [],
        }))))
      .catch((err) => {
        if (err?.name !== 'AbortError') setOrganizers([]);
      })
      .finally(() => {
        // A superseded request must not end the loading state of the one that replaced it.
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedSearch, cityFilter]);

  const filtered = organizers.filter((eo) => {
    const matchesSearch = true;
    const matchesCat = selectedCategory === 'ALL' || eo.category === selectedCategory;
    const matchesCity = selectedCity === 'ALL' || eo.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesCat && matchesCity;
  });

  return (
    <div ref={pageRef} className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Direktori Event Organizer & Promotor Terverifikasi | Event Yuk"
        description="Daftar promotor dan event organizer berlisensi resmi di Indonesia dengan rekam jejak terverifikasi e-KYC. Akses pagu anggaran acara, peluang kemitraan vendor, audisi musisi, dan rekrutmen kru."
        keywords="event organizer terpercaya, promotor konser jakarta, eo pensi sekolah, profil eo indonesia, escrow pks acara"
        canonicalPath="/organizers"
      />

      {/* Page Header */}
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <Calendar aria-hidden="true" className="h-4 w-4" />
          Direktori promotor dan event organizer
        </p>
        <h1 key={language} data-split-title className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink sm:text-6xl">
          {t('orgs.title')}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Penyelenggara festival musik, pensi sekolah, dan pameran dengan rekam jejak, pagu anggaran, dan ulasan yang bisa kamu lihat sebelum menghubungi.
        </p>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label={t('orgs.searchLabel')}
            placeholder={t('orgs.searchPh')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-14 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter aria-hidden="true" className="mr-1 h-4 w-4 shrink-0 text-slate-600" />
          {[
            { id: 'ALL', label: 'Semua kategori' },
            { id: 'CONCERT', label: 'Festival musik' },
            { id: 'PENSI', label: 'Pensi sekolah' },
            { id: 'EXPO', label: 'Pameran dan bazaar' },
            { id: 'CORPORATE', label: 'Corporate MICE' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                selectedCategory === cat.id
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : 'border-brand-navy/25 text-brand-ink hover:border-brand-navy'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="h-4 w-4 text-slate-600" />
          <select
            aria-label={t('common.cityFilter')}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="min-h-11 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
          >
            <option value="ALL">{t('common.allCities')}</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
            <option value="Yogyakarta">Yogyakarta</option>
          </select>
        </div>
      </div>

      {/* Organizer Cards Grid */}
      {loading ? (
        <PartnerCardsSkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('common.noResults')}
          body={t('common.noResultsBody')}
          actionLabel={t('common.reset')}
          onAction={() => { setSearchTerm(''); setSelectedCity('ALL'); setSelectedCategory('ALL'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 ey-stagger">
        {filtered.map((eo) => (
          <div
            key={eo.id}
            data-gsap-reveal
            className="ey-lift flex flex-col overflow-hidden rounded-lg bg-white"
          >
            {/* Banner Top */}
            <div className="relative h-36 overflow-hidden bg-brand-navy-light">
              <img
                src={eo.bannerImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-brand-ink">
                <Award aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                <span>Rating {eo.rating} / 5.0</span>
              </div>
            </div>

            {/* Content & Avatar */}
            <div className="p-6 pt-0 flex-1 flex flex-col -mt-8 relative">
              <div className="flex items-start justify-between">
                <Avatar
                  src={eo.avatar}
                  name={eo.name}
                  decorative
                  className="h-16 w-16 rounded-lg border-4 border-white bg-white"
                />
                {eo.verified && (
                  <span className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-brand-forest-light px-3 py-1 text-xs font-semibold text-brand-forest-dark">
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                    <span>e-KYC terverifikasi</span>
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="flex items-center gap-1.5 font-display text-xl font-extrabold tracking-[-0.03em] text-brand-ink">
                  <span>{eo.name}</span>
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                    <span>{eo.city}</span>
                  </span>
                  <span aria-hidden="true">•</span>
                  <span className="font-semibold text-brand-navy">{eo.category}</span>
                </div>
              </div>

              <p className="mt-3 text-base leading-7 text-slate-700">
                {eo.description}
              </p>

              {/* Stats Bar */}
              <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-brand-cream p-4">
                <div>
                  <dt className="text-sm text-slate-700">Proyek selesai</dt>
                  <dd className="mt-0.5 font-display text-lg font-extrabold tracking-[-0.02em] text-brand-ink">{eo.totalEventsCompleted} acara sukses</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-700">Total audiens</dt>
                  <dd className="mt-0.5 font-display text-lg font-extrabold tracking-[-0.02em] text-brand-ink">{eo.totalAttendeesServed} pengunjung</dd>
                </div>
              </dl>

              {/* Specialties Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {eo.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-brand-lime-soft px-3 py-1 text-sm font-medium text-brand-navy"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Highlight Projects */}
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-800">Portofolio unggulan</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {eo.pastHighlightEvents.join(' • ')}
                </p>
              </div>

              {/* Contact & Invite Action */}
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                  <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-600" />
                  <span className="truncate">{eo.contactEmail}</span>
                </div>

                <Link
                  to={`/organizers/${eo.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
                >
                  <span>Lihat rekam jejak</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
