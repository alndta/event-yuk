import { useState, useEffect } from 'react';
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
import { cachedFetch } from '../utils/apiCache';

interface Props {
  onProposeVendor?: (vendor: PartnerItem) => void;
}

export default function SearchVendorsPage({ onProposeVendor: _onProposeVendor }: Props) {
  const [vendors, setVendors] = useState<PartnerItem[]>(() =>
    mockPartners.filter((p) => p.type === 'VENDOR')
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    cachedFetch('/api/v1/users/partners?type=VENDOR')
      .then((resData: any) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setVendors(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' ||
      v.categoryLabel.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesCity =
      selectedCity === 'ALL' || v.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesCat && matchesCity;
  });

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Vendor Sound System, Lighting, LED & Rigging Panggung | Event Yuk"
        description="Katalog vendor perlengkapan konser dan panggung terverifikasi di Indonesia. Sewa sound system line array, panggung rigging aluminium, lighting bergerak, videotron LED screen, dan genset silent bergaransi BAST."
        keywords="sewa sound system konser, rental led screen videotron, sewa panggung rigging, rental genset silent jakarta, vendor konser"
        canonicalPath="/vendors"
      />

      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200">
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          <span>Katalog Mitra Vendor Produksi & Peralatan Konser</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cari Vendor Produksi Panggung & Alat
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Temukan vendor sound system line array, tata panggung rigging, lighting bergerak, videotron LED screen, dan genset silent berstandar K3 dengan proteksi pembayaran Escrow BAST digital.
        </p>

        {/* Search Input */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Cari spesifikasi (misal: Line Array, LED P3.9, Genset 100 kVA, Rigging 12x10m)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 sm:pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-300 shadow-xs text-xs sm:text-sm focus:ring-2 focus:ring-[#172D46] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: 'ALL', label: 'Semua Vendor' },
            { id: 'Sound', label: 'Sound System' },
            { id: 'Lighting', label: 'Lighting & LED' },
            { id: 'Rigging', label: 'Rigging & Stage' },
            { id: 'Genset', label: 'Genset & Power' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-white border border-slate-300 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#172D46]"
          >
            <option value="ALL">Semua Kota</option>
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
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <img
                  src={vendor.avatar}
                  alt={vendor.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {vendor.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Award className="w-3.5 h-3.5 text-[#5E7628]" />
                      <span>{vendor.rating} / 5.0</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
                    <span>{vendor.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#456B39]" />
                    <span>{vendor.city}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{vendor.completedGigs} Acara Tersuplai</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-3">
                {vendor.description}
              </p>

              {/* Price Range */}
              <div className="mt-4 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Perkiraan Biaya Sewa / Paket Produksi</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{vendor.priceRange}</div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Escrow BAST</span>
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span>Daftar Spesifikasi Teknis & Unit Siap Pasang:</span>
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-indigo-200">
                  {vendor.specsOrRiders.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 leading-snug">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Pencairan DP 30-50% via Surat Jalan & Pelunasan via BAST Digital
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/vendors/${vendor.id}`}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>Lihat Detail Alat & Sewa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
