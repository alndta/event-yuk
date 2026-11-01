import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Building,
  MapPin,
  Phone,
  FileText,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { UserRole } from '../components/RoleOnboardingModal';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';

export default function RoleOnboardingPage() {
  const navigate = useNavigate();
  const { user, setAccountRole, logout } = useAuth();

  // If user already has an active permanent role, redirect directly to their dashboard
  if (user && user.activeRole) {
    return <Navigate to="/dashboard" replace />;
  }

  const [selectedRole, setSelectedRole] = useState<UserRole>('VENDOR');
  const [businessName, setBusinessName] = useState(user?.fullName || '');
  const [cityRegion, setCityRegion] = useState('Jakarta Selatan');
  const [category, setCategory] = useState('');
  const [phoneWa, setPhoneWa] = useState(user?.phoneWa || '');
  const [bioDescription, setBioDescription] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleDefinitions = [
    {
      id: 'VENDOR' as UserRole,
      title: 'Vendor Produksi & Peralatan',
      badge: 'Penyedia Alat Konser',
      icon: Sliders,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeColor: 'ring-2 ring-indigo-600 bg-indigo-50/50 border-indigo-600',
      desc: 'Penyedia Sound System, Tata Lampu, LED Screen, Stage Rigging, dan Genset.',
      catalogTitle: 'Katalog Alat Produksi',
      placeholderCategory: 'Contoh: Line Array & Lighting Moving Beam',
      nameLabel: 'Nama Usaha / Rental Produksi',
    },
    {
      id: 'TALENT' as UserRole,
      title: 'Musisi & Manajemen Band',
      badge: 'Artis & Guest Stars',
      icon: Music,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      activeColor: 'ring-2 ring-purple-600 bg-purple-50/50 border-purple-600',
      desc: 'Band indie, musisi solois, DJ, MC, dan manajemen talenta pertunjukan live.',
      catalogTitle: 'Rate Card & Riders Manggung',
      placeholderCategory: 'Contoh: Indie Pop / Pop Rock 5 Personel',
      nameLabel: 'Nama Band / Artis Panggung',
    },
    {
      id: 'TENANT' as UserRole,
      title: 'Tenant Kuliner & Pameran',
      badge: 'Penyewa Kaveling Bazaar',
      icon: Store,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeColor: 'ring-2 ring-emerald-600 bg-emerald-50/50 border-emerald-600',
      desc: 'Brand F&B, UMKM kuliner, merchandise musik, dan retail kreatif di arena bazaar.',
      catalogTitle: 'Katalog Menu & Produk Bazaar',
      placeholderCategory: 'Contoh: Artisan Coffee & Korean Street Food',
      nameLabel: 'Nama Brand / Merek Tenant',
    },
    {
      id: 'EO' as UserRole,
      title: 'Event Organizer & Promotor',
      badge: 'Penyelenggara Acara',
      icon: Calendar,
      color: 'bg-sky-50 text-[#172D46] border-sky-200',
      activeColor: 'ring-2 ring-[#172D46] bg-sky-50/50 border-[#172D46]',
      desc: 'Promotor musik, panitia pensi kampus/sekolah, dan pengelola festival.',
      catalogTitle: 'Proyek Acara & Pengadaan',
      placeholderCategory: 'Contoh: Festival Musik Tahunan & Pensi Sekolah',
      nameLabel: 'Nama Organizer / Lembaga Promotor',
    },
    {
      id: 'SPONSOR' as UserRole,
      title: 'Sponsor Brand & Korporasi',
      badge: 'Brand Partner & Agensi',
      icon: Building2,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      activeColor: 'ring-2 ring-amber-600 bg-amber-50/50 border-amber-600',
      desc: 'Brand manager, media planner, dan korporasi penyedia dana sponsorship.',
      catalogTitle: 'Paket Sponsorship & Stan',
      placeholderCategory: 'Contoh: FMCG / Telekomunikasi / Fintech',
      nameLabel: 'Nama Perusahaan / Brand Sponsor',
    },
    {
      id: 'CREW' as UserRole,
      title: 'Event Crew & Kru Harian',
      badge: 'Tenaga Kerja Lapangan',
      icon: Users,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      activeColor: 'ring-2 ring-rose-600 bg-rose-50/50 border-rose-600',
      desc: 'Liaison Officer (LO), stagehand, ticket gate crew, dan logistik lapangan.',
      catalogTitle: 'Kualifikasi Shift & Rate Honor',
      placeholderCategory: 'Contoh: Hospitality LO Artis & Sound Assistant',
      nameLabel: 'Nama Lengkap Kru Lapangan',
    },
  ];

  const activeDef = roleDefinitions.find((r) => r.id === selectedRole)!;

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMessage('Anda wajib menyetujui ketentuan peran permanen 1 akun.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await setAccountRole({
      role_type: selectedRole,
      business_name: businessName || user?.fullName || 'Mitra Event Yuk',
      city_region: cityRegion,
      category: category || activeDef.placeholderCategory,
      phone_wa: phoneWa,
      bio_description: bioDescription,
    });

    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage(result.error || 'Gagal menyimpan profil peran akun.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16 sm:pb-24">
      <SEOHead
        title="Aktivasi Peran Akun Permanen | Event Yuk"
        description="Lengkapi dan tentukan 1 peran tetap Anda di ekosistem kolaborasi Event Yuk."
        noIndex={true}
      />
      {/* 1. Dedicated Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo-event-yuk.png"
              alt="Event Yuk Logo"
              className="h-8 sm:h-9 w-auto object-contain rounded-xl shadow-2xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#172D46] leading-none">
                Event Yuk
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
                Onboarding Peran
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#172D46] transition px-3 py-1.5 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>

            <button
              onClick={logout}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-200"
              title="Keluar dari akun ini"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar Akun</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Onboarding Form Container with Generous Paddings */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 sm:space-y-12">
        {/* Top Banner Notice: 1 Account = 1 Permanent Role */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172D46] via-[#1B3B56] to-slate-950 p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-slate-800">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#5E7628]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#172D46]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#5E7628] text-xs font-bold border border-white/15 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5E7628]" />
              <span>Aktivasi Ruang Kerja Resmi Akun</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Pilih Peran Utama Akun Anda
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Halo, <strong className="text-white">{user?.fullName || 'Sobat Event'}</strong>! Di Event Yuk, setiap akun memegang <strong className="text-white">1 peran permanen</strong> untuk menjamin validitas kontrak kerjasama (PKS), keamanan dompet Escrow, dan rekam jejak reputasi bisnis Anda.
            </p>

            {/* 1 Account = 1 Role Callout */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-3.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-amber-300">Aturan 1 Akun = 1 Peran Permanen:</strong> Setelah dipilih dan dikonfirmasi, peran akun ini tidak dapat diubah ke kategori lain. Anda akan langsung otomatis memiliki Dashboard khusus untuk mulai mengunggah katalog dagangan dan bertransaksi PKS secara sah.
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Role Selection Grid */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#172D46] text-white text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              <span>Pilih 1 Pilar Peran yang Sesuai dengan Bisnis Anda</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium pl-9 sm:pl-0">
              Klik salah satu kartu peran di bawah untuk memilih
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {roleDefinitions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-left p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? role.activeColor + ' shadow-md scale-[1.01]'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`p-2.5 rounded-2xl border ${role.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terpilih</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                      {role.title}
                    </h3>

                    <span className="inline-block text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-md bg-slate-100">
                      {role.badge}
                    </span>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {role.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Dashboard:</span>
                    <span className="text-slate-900 truncate max-w-[140px]">
                      {role.catalogTitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Profile Form for Selected Role */}
        <section>
          <form
            onSubmit={handleSubmitRole}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6 sm:space-y-8"
          >
            {/* Header of Form */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-xl bg-[#172D46] text-white text-xs font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Lengkapi Profil & Identitas Usaha: {activeDef.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pl-9">
                Data identitas ini akan dicantumkan secara resmi di lembar dokumen PKS digital dan ditampilkan pada profil publik direktori Event Yuk.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Business / Brand Name */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeDef.nameLabel} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Masukkan nama resmi usaha / rental / band / lembaga promotor Anda"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* City / Region */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#456B39]" />
                  <span>Kota / Domisili Operasional *</span>
                </label>
                <input
                  type="text"
                  required
                  value={cityRegion}
                  onChange={(e) => setCityRegion(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan, Bandung, Surabaya"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Phone WhatsApp */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nomor WhatsApp Aktif *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneWa}
                  onChange={(e) => setPhoneWa(e.target.value)}
                  placeholder="+62812xxxxxxx"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Category Specialization */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Kategori Spesialisasi Layanan / Dagangan</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={activeDef.placeholderCategory}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Bio / Description */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  Deskripsi Singkat & Rekam Jejak
                </label>
                <textarea
                  rows={3}
                  value={bioDescription}
                  onChange={(e) => setBioDescription(e.target.value)}
                  placeholder="Tuliskan pengalaman, portofolio acara sebelumnya, atau keunggulan layanan yang Anda sediakan..."
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition shadow-2xs resize-none"
                />
              </div>
            </div>

            {/* Agreement Checkbox Card */}
            <label className="flex items-start gap-3.5 p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 cursor-pointer transition">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#172D46] focus:ring-[#172D46] mt-0.5 shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed font-medium">
                Saya mengonfirmasi bahwa <strong className="text-slate-900">{activeDef.title}</strong> adalah peran tetap akun ini. Saya memahami bahwa 1 akun hanya dapat memiliki 1 peran dan tidak dapat dipindahkan setelah formulir aktivasi ini diserahkan.
              </span>
            </label>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/"
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition text-center sm:text-left order-2 sm:order-1"
              >
                Nanti saja, jelajahi sebagai pengunjung publik
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#456B39] to-[#5E7628] hover:from-[#2F5232] hover:to-[#3F531D] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#456B39]/25 transition disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Mengaktifkan Peran Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Aktifkan Peran & Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
