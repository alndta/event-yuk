import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sliders,
  Music,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  Send,
  FileText,
  Wrench,
  Volume2,
  Users,
  Clock,
  Building2,
} from 'lucide-react';
import { mockPartners, PartnerItem } from '../data/mockPartners';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { DetailSkeleton } from '../components/skeletons/DetailSkeleton';
import { cachedFetch } from '../utils/apiCache';

interface Props {
  onProposePartner: (partner: PartnerItem) => void;
}

export default function PartnerDetailPage({ onProposePartner }: Props) {
  const { id } = useParams();
  const { requireAuth } = useAuth();

  const fallbackPartner = mockPartners.find((p) => p.id === id) || mockPartners[0];
  const [partner, setPartner] = useState<any>(fallbackPartner);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    cachedFetch(`/api/v1/users/partners/${id}`)
      .then((resData: any) => {
        if (resData.success && resData.data) {
          setPartner(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleProposeClick = () => {
    requireAuth(() => {
      onProposePartner({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        categoryLabel: partner.categoryLabel,
        city: partner.city,
        rating: partner.rating,
        avatar: partner.avatar,
        priceRange: partner.priceRange || 'Sesuai Kesepakatan',
        specsOrRiders: partner.specsOrRiders || [],
        description: partner.description || '',
        completedGigs: partner.completedGigs || 45,
        experienceYears: partner.experienceYears || 6,
      });
    }, `Ingin mengajak ${partner.name} berkolaborasi? Masuk akun dulu agar pengajuan resmi langsung terkirim.`);
  };

  const isVendor = partner.type === 'VENDOR';
  const isTalent = partner.type === 'TALENT';
  const isEO = partner.type === 'EO';

  const packages = partner.packages || [];
  const talentProfile = partner.talentProfile;

  const partnerSchema = partner
    ? {
        '@context': 'https://schema.org',
        '@type': isTalent ? 'MusicGroup' : 'LocalBusiness',
        name: partner.name,
        image: [partner.avatar],
        description: partner.description || `${partner.categoryLabel} di ${partner.city}.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: partner.city || 'Jakarta',
          addressCountry: 'ID',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: partner.rating || '4.9',
          reviewCount: partner.completedGigs || '45',
        },
      }
    : undefined;

  if (loading && !partner) {
    return <DetailSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <SEOHead
        title={`${partner.name} — Spesifikasi, Rate Card & Sewa | Event Yuk`}
        description={
          partner.description
            ? `${partner.description.slice(0, 150)}... Bergaransi pembayaran aman Rekening Bersama Escrow & PKS digital.`
            : `Lihat profil ${partner.name}, spesifikasi teknis, harga sewa / rate card di ${partner.city}.`
        }
        keywords={`${partner.name}, sewa ${partner.name}, rate card ${partner.name}, ${partner.categoryLabel}, ${partner.city}`}
        canonicalPath={`/partners/${partner.id || id}`}
        ogImage={partner.avatar}
        schemaJson={partnerSchema}
      />

      {/* Top Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={isVendor ? '/vendors' : isTalent ? '/bands' : '/organizers'}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Direktori {isVendor ? 'Vendor' : isTalent ? 'Band & Musisi' : 'Mitra'}</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mitra Terverifikasi e-KYC & Escrow</span>
        </span>
      </div>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl mb-8">
        <div className="h-56 sm:h-72 relative">
          <img
            src={partner.avatar || '/assets/hero-concert.jpg'}
            alt={partner.name}
            className="w-full h-full object-cover opacity-40 blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Partner Info Overlaid */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <img
                src={partner.avatar || '/assets/vendor-sound.jpg'}
                alt={partner.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
              />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#456B39] text-white mb-1.5">
                  {isVendor ? (
                    <Sliders className="w-3 h-3" />
                  ) : isTalent ? (
                    <Music className="w-3 h-3" />
                  ) : (
                    <Building2 className="w-3 h-3" />
                  )}
                  <span>{partner.categoryLabel}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  <span>{partner.name}</span>
                  <CheckCircle2 className="w-5 h-5 text-sky-400" />
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#456B39]" />
                    <span>{partner.city}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#5E7628] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#5E7628]" />
                    <span>{partner.rating} / 5.0 Rating Mitra</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-200 font-semibold">
                    {partner.completedGigs || 45} Acara Berhasil
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProposeClick}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#456B39] to-[#5E7628] hover:from-[#2F5232] hover:to-[#3F531D] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-[#456B39]/30 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{isVendor ? 'Ajukan Sewa Alat' : isTalent ? 'Ajukan Tawaran Manggung' : 'Ajak Kolaborasi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: About & Capabilities */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#172D46]" />
              <span>Tentang & Karakteristik Mitra</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {partner.description ||
                'Mitra terverifikasi resmi dalam ekosistem Event Yuk dengan jaminan kepatuhan teknis, transparansi biaya, dan kontrak digital yang mengikat secara hukum.'}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Pengalaman Kerja</span>
                <span className="text-slate-900 font-extrabold text-sm mt-0.5 block">
                  {partner.experienceYears || 6} Tahun di Industri
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Status Verifikasi</span>
                <span className="text-emerald-700 font-extrabold text-sm mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>e-KYC Lolos</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-slate-400 font-medium block">Garansi Escrow</span>
                <span className="text-[#172D46] font-extrabold text-sm mt-0.5 block">
                  Pencairan Bertahap
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Specific Details for VENDOR */}
          {isVendor && (
            <div className="space-y-6">
              {/* Equipment Catalog & Packages */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <span>Katalog Paket & Inventaris Peralatan</span>
                  </h2>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    Standar Keselamatan K3
                  </span>
                </div>

                {packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.map((pkg: any) => (
                      <div
                        key={pkg.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">{pkg.package_name}</h3>
                          <span className="font-black text-base text-indigo-900 font-mono">
                            Rp {Number(pkg.base_price).toLocaleString('id-ID')}
                            <span className="text-xs font-normal text-slate-500"> / Hari</span>
                          </span>
                        </div>

                        {pkg.tech_specs && (
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Spesifikasi Teknis Alat:
                            </div>
                            {Object.entries(pkg.tech_specs).map(([key, val]) => (
                              <div key={key} className="flex justify-between text-slate-700">
                                <span className="capitalize text-slate-500">{key.replace('_', ' ')}:</span>
                                <span className="font-semibold text-slate-900">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500">
                            Kuota Harian: {pkg.daily_quota || 2} Unit Maksimal
                          </span>
                          <button
                            onClick={handleProposeClick}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                          >
                            Pilih Paket Ini
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {partner.specsOrRiders?.map((spec: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800">• {spec}</span>
                        <span className="text-indigo-700 font-semibold">Tersedia untuk Acara</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BAST & Escrow terms */}
              <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Jaminan BAST Digital & Pencairan DP Aman</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vendor ini mematuhi standar kerja Event Yuk: DP 30%–50% ditahan di Rekening Bersama Escrow dan baru dicairkan saat surat jalan atau alat tiba di lokasi. Sisa pelunasan dicairkan setelah Berita Acara Serah Terima (BAST) digital ditandatangani kedua belah pihak pasca-acara selesai.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Specific Details for TALENT / BAND */}
          {isTalent && (
            <div className="space-y-6">
              {/* Technical & Sound Riders */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <span>Technical & Sound Riders Panggung</span>
                  </h2>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                    Genre: {talentProfile?.genre || 'Indie Pop-Rock'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {talentProfile?.technical_riders ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <span className="text-slate-400 font-medium block">Kebutuhan Channel Mixer FOH</span>
                        <span className="font-bold text-slate-900 mt-1 block">
                          {talentProfile.technical_riders.channels || 24} Channel Digital
                        </span>
                      </div>
                      <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <span className="text-slate-400 font-medium block">Sistem Monitor Panggung</span>
                        <span className="font-bold text-slate-900 mt-1 block">
                          {talentProfile.technical_riders.monitors || '4 IEM Wireless + 2 Wedges'}
                        </span>
                      </div>
                      <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 sm:col-span-2">
                        <span className="text-slate-400 font-medium block">Backline Amplifiers Pilihan</span>
                        <span className="font-bold text-slate-900 mt-1 block">
                          {talentProfile.technical_riders.amps || 'Fender Twin Reverb (Gitar) & Ampeg SVT-CL (Bass)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {partner.specsOrRiders?.map((rider: string, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-slate-700">
                          • {rider}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hospitality Riders */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Hospitality & Kebutuhan Ruang Artis</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-medium block">Ruang Tunggu Backstage</span>
                    <span className="font-bold text-slate-800 mt-1 block">
                      {talentProfile?.hospitality_riders?.rooms || '1 Ruang VIP AC Bersih'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-medium block">Konsumsi Personil</span>
                    <span className="font-bold text-slate-800 mt-1 block">
                      {talentProfile?.hospitality_riders?.meals || '15 Box Bento & Buah'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-medium block">Transportasi Lokal</span>
                    <span className="font-bold text-slate-800 mt-1 block">
                      {talentProfile?.hospitality_riders?.transfers || '2 Unit Van / HiAce'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking & Cancellation Guarantee */}
              <div className="p-6 bg-purple-950 rounded-3xl text-white space-y-2.5">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#5E7628]" />
                  <span>PKS Sah & Kebijakan Anti-Cancel Sepihak</span>
                </div>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Semua penawaran manggung wajib dituangkan ke dalam PKS digital resmi. DP terkunci aman di Escrow dan hanya cair sesuai termin kesepakatan (50% saat PKS ditandatangani, 50% setelah soundcheck/tampil).
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Specific Details for EO / ORGANIZER */}
          {isEO && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#172D46]" />
                <span>Standar Produksi & Manajemen Acara</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Penyelenggara acara resmi dengan rekam jejak penyelenggaraan festival terbuka, pensi kampus/sekolah, dan bazaar tematik. Mengedepankan standarisasi keselamatan massa, perizinan lengkap, dan ketepatan waktu pembayaran vendor & kru.
              </p>
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900">
                <span className="font-bold block mb-1">Membuka Kemitraan:</span>
                <span>Vendor sound & lighting, tenant kuliner/bazaar, serta kru lapangan untuk proyek acara aktif.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 sticky top-24">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Perkiraan Honor / Tarif
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {partner.priceRange || 'Rp 25.000.000'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dapat dinegosiasikan melalui fitur Counter-Offer di ruang kerja PKS.
              </p>
            </div>

            <button
              onClick={handleProposeClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#172D46] to-[#0F263B] hover:from-[#0F263B] hover:to-[#0B1F31] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#172D46]/25 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#5E7628]" />
              <span>{isVendor ? 'Ajukan Tawaran Sewa Alat' : isTalent ? 'Ajukan Jadwal Manggung' : 'Ajak Kolaborasi Proyek'}</span>
            </button>

            {/* Value Guarantees */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dana DP 50% terlindungi di Escrow Midtrans</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Surat Perjanjian Kerjasama (PKS) digital resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Respon kurasi rata-rata dalam 1x24 jam</span>
              </div>
            </div>

            {/* Manager / Business Info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Kontak & Komunikasi:
              </div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>+62 811-2233-4455 (WhatsApp Resmi)</span>
              </div>
              <div className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>kerjasama@{partner.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.id</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
