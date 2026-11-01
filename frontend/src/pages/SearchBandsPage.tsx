import { useState, useEffect } from 'react';
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
import { mockPartners, PartnerItem } from '../data/mockPartners';
import { PartnerCardsSkeletonList } from '../components/skeletons/PartnerCardSkeleton';
import { SEOHead } from '../components/SEOHead';
import { cachedFetch } from '../utils/apiCache';

interface Props {
  onProposeTalent?: (talent: PartnerItem) => void;
}

export default function SearchBandsPage({ onProposeTalent: _onProposeTalent }: Props) {
  const [bands, setBands] = useState<PartnerItem[]>(() =>
    mockPartners.filter((p) => p.type === 'TALENT')
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    cachedFetch('/api/v1/users/partners?type=TALENT')
      .then((resData: any) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setBands(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = bands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.genreOrCategory && b.genreOrCategory.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre =
      selectedGenre === 'ALL' || (b.genreOrCategory && b.genreOrCategory.toLowerCase().includes(selectedGenre.toLowerCase()));
    const matchesCity =
      selectedCity === 'ALL' || b.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesGenre && matchesCity;
  });

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Direktori Band, Musisi Panggung & Manajemen Artis | Event Yuk"
        description="Booking band indie, pop, jazz, dan musisi tamu profesional untuk konser dan pensi sekolah. Transparansi rate card honor manggung, kepastian riders teknis & konsumsi, bergaransi rekening bersama Escrow."
        keywords="booking band pensi, artis konser musik, rate card band festival, technical riders artis, sewa musisi jakarta"
        canonicalPath="/bands"
      />

      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-3 border border-purple-200">
          <Music className="w-3.5 h-3.5 text-purple-600" />
          <span>Direktori Manajemen Band, Artis & Musisi Festival</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cari Band & Musisi Tamu (Guest Stars)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Jelajahi portofolio band indie, pop, jazz, dan musisi tamu dengan transparansi honor manggung (rate card), review teknis riders, serta kepastian kontrak digital PKS.
        </p>

        {/* Search Input */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Ketik nama band, musisi, genre musik, atau kota asal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 sm:pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-300 shadow-xs text-xs sm:text-sm focus:ring-2 focus:ring-[#172D46] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        {/* Genre Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: 'ALL', label: 'Semua Genre' },
            { id: 'Indie Rock', label: 'Indie Rock' },
            { id: 'Soul & Jazz', label: 'Soul & Jazz' },
            { id: 'Pop Folk', label: 'Pop Folk' },
            { id: 'EDM', label: 'EDM & Synth' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedGenre(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedGenre === cat.id
                  ? 'bg-purple-700 text-white shadow-sm'
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
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="p-6">
              {/* Header: Avatar, Name, Genre */}
              <div className="flex items-start gap-4">
                <img
                  src={band.avatar}
                  alt={band.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {band.genreOrCategory || band.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Award className="w-3.5 h-3.5 text-[#5E7628]" />
                      <span>{band.rating} / 5.0</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
                    <span>{band.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#456B39]" />
                    <span>{band.city}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{band.completedGigs} Show Selesai</span>
                  </div>
                </div>
              </div>

              {/* Bio Description */}
              <p className="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-3">
                {band.description}
              </p>

              {/* Rate Card Box */}
              <div className="mt-4 p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Perkiraan Honor Manggung (Rate Card)</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{band.priceRange}</div>
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-white px-2 py-1 rounded-lg border border-purple-200 shadow-2xs">
                  Escrow Termin
                </span>
              </div>

              {/* Riders Specifications */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ringkasan Technical & Hospitality Riders:</span>
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-purple-200">
                  {band.specsOrRiders.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 leading-snug">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Info */}
              {band.managerContact && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-medium text-slate-700">{band.managerContact}</span>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                PKS digital & termin DP 50:50 / 70:30
              </span>
              <Link
                to={`/bands/${band.id}`}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Lihat Riders & Ajukan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
