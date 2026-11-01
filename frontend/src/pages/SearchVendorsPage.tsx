import { useState, useEffect, useRef } from 'react';
import useGsapReveal from '../hooks/useGsapReveal';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Sliders,
  MapPin,
  CheckCircle2,
  Award,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { mockPartners, PartnerItem } from '../data/mockPartners';
import { PartnerCardsSkeletonList } from '../components/skeletons/PartnerCardSkeleton';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';
import { api, query } from '../lib/api';
import useDebounced from '../hooks/useDebounced';
import Avatar from '../components/Avatar';

interface Props {
  onProposeVendor?: (vendor: PartnerItem) => void;
}

export default function SearchVendorsPage({ onProposeVendor: _onProposeVendor }: Props) {
  const { t, language } = useLanguage();
  const [vendors, setVendors] = useState<PartnerItem[]>(() =>
    import.meta.env.DEV ? mockPartners.filter((p) => p.type === 'VENDOR') : []
  );
  const [loading, setLoading] = useState<boolean>(false);
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
    api('/partners' + query({ type: 'VENDOR', q: debouncedSearch, city: cityFilter }), { anonymous: true, signal: controller.signal })
      .then((resData) => setVendors(resData.data || []))
      .catch((err) => {
        if (err?.name !== 'AbortError' && !import.meta.env.DEV) setVendors([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedSearch, cityFilter]);

  const filtered = vendors.filter((v) => {
    const matchesSearch = true;
    const matchesCat =
      selectedCategory === 'ALL' ||
      v.categoryLabel.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesCity =
      selectedCity === 'ALL' || v.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesCat && matchesCity;
  });

  return (
    <div ref={pageRef} className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Vendor Sound System, Lighting, LED & Rigging Panggung | Event Yuk"
        description="Katalog vendor perlengkapan konser dan panggung terverifikasi di Indonesia. Sewa sound system line array, panggung rigging aluminium, lighting bergerak, videotron LED screen, dan genset silent bergaransi BAST."
        keywords="sewa sound system konser, rental led screen videotron, sewa panggung rigging, rental genset silent jakarta, vendor konser"
        canonicalPath="/vendors"
      />

      {/* Header */}
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <Sliders aria-hidden="true" className="h-4 w-4" />
          {t('vendors.eyebrow')}
        </p>
        <h1 key={language} data-split-title className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink sm:text-6xl">
          {t('vendors.title')}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          {t('vendors.lead')}
        </p>

        {/* Search Input */}
        <div className="mt-5 relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label={t('vendors.searchLabel')}
            placeholder={t('vendors.searchPh')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-14 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter aria-hidden="true" className="mr-1 h-4 w-4 shrink-0 text-slate-600" />
          {[
            { id: 'ALL', label: t('vendors.all') },
            { id: 'Sound', label: t('vendors.sound') },
            { id: 'Lighting', label: t('vendors.lighting') },
            { id: 'Rigging', label: t('vendors.rigging') },
            { id: 'Genset', label: t('vendors.power') },
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
            <option value="Tangerang">Tangerang</option>
            <option value="Bandung">Bandung</option>
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <PartnerCardsSkeletonList count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filtered.map((vendor) => (
          <div
            key={vendor.id}
            data-gsap-reveal
            className="ey-lift flex flex-col justify-between overflow-hidden rounded-lg bg-white"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar
                  src={vendor.avatar}
                  name={vendor.name}
                  decorative
                  className="h-16 w-16 rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-lime-soft px-3 py-1 text-xs font-semibold text-brand-navy">
                      {vendor.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <Award aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                      <span>{vendor.rating} / 5.0</span>
                    </span>
                  </div>

                  <h3 className="mt-1 flex items-center gap-1.5 font-display text-xl font-extrabold tracking-[-0.03em] text-brand-ink">
                    <span>{vendor.name}</span>
                    <CheckCircle2 aria-label={t('common.verified')} className="h-5 w-5 text-brand-forest" />
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                    <span>{vendor.city}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-800">{vendor.completedGigs} acara tersuplai</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 line-clamp-3 text-base leading-7 text-slate-700">
                {vendor.description}
              </p>

              {/* Price Range */}
              <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-brand-cream p-4">
                <div>
                  <div className="text-sm text-slate-700">{t('vendors.priceNote')}</div>
                  <div className="mt-0.5 font-display text-lg font-extrabold tracking-[-0.02em] text-brand-ink">{vendor.priceRange}</div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-forest-dark">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  <span>Escrow BAST</span>
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Wrench aria-hidden="true" className="h-4 w-4 text-slate-600" />
                  <span>{t('vendors.specs')}</span>
                </div>
                <ul className="space-y-1.5 border-l-2 border-brand-navy/20 pl-4">
                  {vendor.specsOrRiders.map((item, idx) => (
                    <li key={idx} className="text-sm leading-6 text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-600">
                DP 30-50% cair lewat surat jalan, pelunasan lewat BAST digital
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/vendors/${vendor.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
                >
                  <span>{t('vendors.detail')}</span>
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
