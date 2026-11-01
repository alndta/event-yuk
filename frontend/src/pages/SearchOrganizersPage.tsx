import { useState, useEffect } from 'react';
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
import { mockOrganizers, OrganizerItem } from '../data/mockOrganizers';
import { PartnerCardsSkeletonList } from '../components/skeletons/PartnerCardSkeleton';
import { SEOHead } from '../components/SEOHead';
import { cachedFetch } from '../utils/apiCache';

interface Props {
  onInviteOrganizer?: (organizer: OrganizerItem) => void;
}

export default function SearchOrganizersPage({ onInviteOrganizer: _onInviteOrganizer }: Props) {
  const [organizers, setOrganizers] = useState<OrganizerItem[]>(mockOrganizers);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    cachedFetch('/api/v1/users/partners?type=EO')
      .then((resData: any) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const mapped: OrganizerItem[] = resData.data.map((eo: any) => ({
            id: eo.id,
            name: eo.name,
            category: 'CONCERT' as const,
            city: eo.city || 'Jakarta Selatan',
            avatar: eo.avatar || '/assets/crowd-festival.jpg',
            bannerImage: '/assets/hero-concert.jpg',
            rating: eo.rating || 4.9,
            totalEventsCompleted: eo.completedGigs || 28,
            totalAttendeesServed: '320.000+',
            verified: true,
            specialties: eo.specsOrRiders || ['Festival Musik Terbuka', 'Konser Internasional'],
            description: eo.description || 'Penyelenggara acara resmi terdaftar di ekosistem Event Yuk.',
            contactEmail: 'organizer@eventyuk.id',
            phone: '+62 811-2233-4455',
            pastHighlightEvents: ['Soundfest Archipelago 2027', 'Jakarta Creative Gathering'],
          }));
          setOrganizers(mapped);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = organizers.filter((eo) => {
    const matchesSearch =
      eo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eo.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || eo.category === selectedCategory;
    const matchesCity = selectedCity === 'ALL' || eo.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesCat && matchesCity;
  });

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title="Direktori Event Organizer & Promotor Terverifikasi | Event Yuk"
        description="Daftar promotor dan event organizer berlisensi resmi di Indonesia dengan rekam jejak terverifikasi e-KYC. Akses pagu anggaran acara, peluang kemitraan vendor, audisi musisi, dan rekrutmen kru."
        keywords="event organizer terpercaya, promotor konser jakarta, eo pensi sekolah, profil eo indonesia, escrow pks acara"
        canonicalPath="/organizers"
      />

      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172D46]/10 text-[#172D46] text-xs font-bold mb-3 border border-[#172D46]/20">
          <Calendar className="w-3.5 h-3.5 text-[#172D46]" />
          <span>Direktori Promotor & Event Organizer Resmi</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Cari & Eksplorasi Event Organizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Temukan penyelenggara acara musik festival, pensi sekolah, dan pameran terverifikasi dengan rekam jejak terbukti, transparansi pagu anggaran, serta ulasan ekosistem.
        </p>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Ketik nama EO, kota, spesialisasi festival, pensi, atau pameran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 sm:pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-300 shadow-xs text-xs sm:text-sm focus:ring-2 focus:ring-[#172D46] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: 'ALL', label: 'Semua Kategori' },
            { id: 'CONCERT', label: 'Festival Musik' },
            { id: 'PENSI', label: 'Pensi Sekolah' },
            { id: 'EXPO', label: 'Pameran & Bazaar' },
            { id: 'CORPORATE', label: 'Corporate MICE' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#172D46] text-white shadow-sm'
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
            <option value="Surabaya">Surabaya</option>
            <option value="Yogyakarta">Yogyakarta</option>
          </select>
        </div>
      </div>

      {/* Organizer Cards Grid */}
      {loading ? (
        <PartnerCardsSkeletonList count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filtered.map((eo) => (
          <div
            key={eo.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
          >
            {/* Banner Top */}
            <div className="h-32 relative bg-slate-900 overflow-hidden">
              <img
                src={eo.bannerImage}
                alt={eo.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-800 shadow-sm">
                <Award className="w-3.5 h-3.5 text-[#5E7628]" />
                <span>Rating {eo.rating} / 5.0</span>
              </div>
            </div>

            {/* Content & Avatar */}
            <div className="p-6 pt-0 flex-1 flex flex-col -mt-8 relative">
              <div className="flex items-start justify-between">
                <img
                  src={eo.avatar}
                  alt={eo.name}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                />
                {eo.verified && (
                  <span className="mt-9 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    <span>e-KYC Terverifikasi</span>
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  <span>{eo.name}</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#456B39]" />
                    <span>{eo.city}</span>
                  </span>
                  <span>•</span>
                  <span className="text-[#172D46] font-bold">{eo.category}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {eo.description}
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3 mt-4 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Proyek Selesai</div>
                  <div className="font-black text-slate-900 text-sm mt-0.5">{eo.totalEventsCompleted} Acara Sukses</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Audiens</div>
                  <div className="font-black text-[#172D46] text-sm mt-0.5">{eo.totalAttendeesServed} Pengunjung</div>
                </div>
              </div>

              {/* Specialties Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {eo.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Highlight Projects */}
              <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Portofolio Unggulan:</div>
                <div className="flex flex-wrap gap-1 text-slate-700 font-medium">
                  {eo.pastHighlightEvents.join(' • ')}
                </div>
              </div>

              {/* Contact & Invite Action */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[140px]">{eo.contactEmail}</span>
                  </span>
                </div>

                <Link
                  to={`/organizers/${eo.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#172D46] hover:bg-[#0F263B] text-white flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>Lihat Rekam Jejak</span>
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
