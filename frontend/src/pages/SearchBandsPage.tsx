import { useState, useEffect, useRef } from 'react';
import useGsapReveal from '../hooks/useGsapReveal';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Music,
  MapPin,
  CheckCircle2,
  Award,
  Phone,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { PartnerItem } from '../types/models';
import { PartnerCardsSkeletonList } from '../components/skeletons/PartnerCardSkeleton';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';
import { api, query } from '../lib/api';
import useDebounced from '../hooks/useDebounced';
import Avatar from '../components/Avatar';

interface Props {
  onProposeTalent?: (talent: PartnerItem) => void;
}

export default function SearchBandsPage({ onProposeTalent: _onProposeTalent }: Props) {
  const { t, language } = useLanguage();
  const [bands, setBands] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, '[data-gsap-reveal]', [loading]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const debouncedSearch = useDebounced(searchTerm.trim(), 300);
  const cityFilter = selectedCity === 'ALL' ? undefined : selectedCity;

  // Search runs on the server. Without a running server, development builds fall back to the bundled samples.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api('/partners' + query({ type: 'TALENT', q: debouncedSearch, city: cityFilter }), { anonymous: true, signal: controller.signal })
      .then((resData) => setBands(resData.data || []))
      .catch((err) => {
        if (err?.name !== 'AbortError') setBands([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedSearch, cityFilter]);

  const filtered = bands.filter((b) => {
    const matchesSearch = true;
    const matchesGenre =
      selectedGenre === 'ALL' || (b.genreOrCategory && b.genreOrCategory.toLowerCase().includes(selectedGenre.toLowerCase()));
    const matchesCity =
      selectedCity === 'ALL' || b.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesGenre && matchesCity;
  });

  return (
    <div ref={pageRef} className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Direktori Band, Musisi Panggung & Manajemen Artis | Event Yuk"
        description="Booking band indie, pop, jazz, dan musisi tamu profesional untuk konser dan pensi sekolah. Transparansi rate card honor manggung, kepastian riders teknis & konsumsi, bergaransi rekening bersama Escrow."
        keywords="booking band pensi, artis konser musik, rate card band festival, technical riders artis, sewa musisi jakarta"
        canonicalPath="/bands"
      />

      {/* Header */}
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <Music aria-hidden="true" className="h-4 w-4" />
          Direktori band, artis, dan musisi festival
        </p>
        <h1 key={language} data-split-title className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink sm:text-6xl">
          {t('bands.title')}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Lihat portofolio band indie, pop, jazz, dan musisi tamu lengkap dengan rate card honor, ringkasan technical rider, dan kontrak digital PKS.
        </p>

        {/* Search Input */}
        <div className="mt-5 relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label={t('bands.searchLabel')}
            placeholder={t('bands.searchPh')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-14 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        {/* Genre Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter aria-hidden="true" className="mr-1 h-4 w-4 shrink-0 text-slate-600" />
          {[
            { id: 'ALL', label: 'Semua genre' },
            { id: 'Indie Rock', label: 'Indie Rock' },
            { id: 'Soul & Jazz', label: 'Soul & Jazz' },
            { id: 'Pop Folk', label: 'Pop Folk' },
            { id: 'EDM', label: 'EDM & Synth' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedGenre(cat.id)}
              aria-pressed={selectedGenre === cat.id}
              className={`min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                selectedGenre === cat.id
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
            <option value="Yogyakarta">Yogyakarta</option>
          </select>
        </div>
      </div>

      {/* Band Cards Grid */}
      {loading ? (
        <PartnerCardsSkeletonList count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filtered.map((band) => (
          <div
            key={band.id}
            data-gsap-reveal
            className="ey-lift flex flex-col justify-between overflow-hidden rounded-lg bg-white"
          >
            <div className="p-6">
              {/* Header: Avatar, Name, Genre */}
              <div className="flex items-start gap-4">
                <Avatar
                  src={band.avatar}
                  name={band.name}
                  decorative
                  className="h-16 w-16 rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-lime-soft px-3 py-1 text-xs font-semibold text-brand-navy">
                      {band.genreOrCategory || band.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <Award aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                      <span>{band.rating} / 5.0</span>
                    </span>
                  </div>

                  <h3 className="mt-1 flex items-center gap-1.5 font-display text-xl font-extrabold tracking-[-0.03em] text-brand-ink">
                    <span>{band.name}</span>
                    <CheckCircle2 aria-label="Terverifikasi" className="h-5 w-5 text-brand-forest" />
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                    <span>{band.city}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-800">{band.completedGigs} show selesai</span>
                  </div>
                </div>
              </div>

              {/* Bio Description */}
              <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-700">
                {band.description}
              </p>

              {/* Rate Card Box */}
              <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-brand-cream p-4">
                <div>
                  <div className="text-sm text-slate-700">Perkiraan honor manggung (rate card)</div>
                  <div className="mt-0.5 font-display text-lg font-extrabold tracking-[-0.02em] text-brand-ink">{band.priceRange}</div>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest-dark">
                  Escrow termin
                </span>
              </div>

              {/* Riders Specifications */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText aria-hidden="true" className="h-4 w-4 text-slate-600" />
                  <span>Ringkasan technical dan hospitality rider</span>
                </div>
                <ul className="space-y-1.5 border-l-2 border-brand-navy/20 pl-4">
                  {band.specsOrRiders.map((item, idx) => (
                    <li key={idx} className="text-sm leading-6 text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Manager Info */}
              {band.managerContact && (
                <div className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <Phone aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                  <span className="font-medium text-slate-800">{band.managerContact}</span>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-600">
                PKS digital dengan termin DP 50:50 atau 70:30
              </span>
              <Link
                to={`/bands/${band.id}`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
              >
                <span>Lihat rider dan ajukan</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
