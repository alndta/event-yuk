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
      title: 'Vendor produksi dan peralatan',
      badge: 'Penyedia alat konser',
      icon: Sliders,
      color: 'bg-brand-lime-soft text-brand-navy border-brand-navy/15',
      activeColor: 'ring-2 ring-brand-navy bg-brand-lime-soft border-brand-navy',
      desc: 'Penyedia Sound System, Tata Lampu, LED Screen, Stage Rigging, dan Genset.',
      catalogTitle: 'Katalog alat produksi',
      placeholderCategory: 'Contoh: Line Array & Lighting Moving Beam',
      nameLabel: 'Nama usaha atau rental produksi',
    },
    {
      id: 'TALENT' as UserRole,
      title: 'Musisi dan manajemen band',
      badge: 'Artis dan guest star',
      icon: Music,
      color: 'bg-brand-lime-soft text-brand-navy border-brand-navy/15',
      activeColor: 'ring-2 ring-brand-navy bg-brand-lime-soft border-brand-navy',
      desc: 'Band indie, musisi solois, DJ, MC, dan manajemen talenta pertunjukan live.',
      catalogTitle: 'Rate card dan rider manggung',
      placeholderCategory: 'Contoh: Indie Pop / Pop Rock 5 Personel',
      nameLabel: 'Nama band atau artis panggung',
    },
    {
      id: 'TENANT' as UserRole,
      title: 'Tenant kuliner dan pameran',
      badge: 'Penyewa kaveling bazaar',
      icon: Store,
      color: 'bg-brand-lime-soft text-brand-navy border-brand-navy/15',
      activeColor: 'ring-2 ring-brand-navy bg-brand-lime-soft border-brand-navy',
      desc: 'Brand F&B, UMKM kuliner, merchandise musik, dan retail kreatif di arena bazaar.',
      catalogTitle: 'Menu dan produk bazaar',
      placeholderCategory: 'Contoh: Artisan Coffee & Korean Street Food',
      nameLabel: 'Nama brand atau merek tenant',
    },
    {
      id: 'EO' as UserRole,
      title: 'Event organizer dan promotor',
      badge: 'Penyelenggara acara',
      icon: Calendar,
      color: 'bg-brand-lime-soft text-brand-navy border-brand-navy/15',
      activeColor: 'ring-2 ring-brand-navy bg-brand-lime-soft border-brand-navy',
      desc: 'Promotor musik, panitia pensi kampus/sekolah, dan pengelola festival.',
      catalogTitle: 'Proyek acara dan pengadaan',
      placeholderCategory: 'Contoh: Festival Musik Tahunan & Pensi Sekolah',
      nameLabel: 'Nama organizer atau lembaga promotor',
    },
    {
      id: 'SPONSOR' as UserRole,
      title: 'Sponsor brand dan korporasi',
      badge: 'Brand partner dan agensi',
      icon: Building2,
      color: 'bg-brand-lime-soft text-brand-navy border-brand-navy/15',
      activeColor: 'ring-2 ring-brand-navy bg-brand-lime-soft border-brand-navy',
      desc: 'Brand manager, media planner, dan korporasi penyedia dana sponsorship.',
      catalogTitle: 'Paket sponsorship dan stan',
      placeholderCategory: 'Contoh: FMCG / Telekomunikasi / Fintech',
      nameLabel: 'Nama perusahaan atau brand sponsor',
    },
    {
      id: 'CREW' as UserRole,
      title: 'Kru harian acara',
      badge: 'Tenaga kerja lapangan',
      icon: Users,
      color: 'bg-brand-lime-soft text-brand-navy border-brand-navy/15',
      activeColor: 'ring-2 ring-brand-navy bg-brand-lime-soft border-brand-navy',
      desc: 'Liaison Officer (LO), stagehand, ticket gate crew, dan logistik lapangan.',
      catalogTitle: 'Kualifikasi shift dan honor',
      placeholderCategory: 'Contoh: Hospitality LO Artis & Sound Assistant',
      nameLabel: 'Nama lengkap kru lapangan',
    },
  ];

  const activeDef = roleDefinitions.find((r) => r.id === selectedRole)!;

  const handleSubmitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMessage('Kamu wajib menyetujui ketentuan peran permanen 1 akun.');
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
        description="Lengkapi dan tentukan 1 peran tetap kamu di ekosistem kolaborasi Event Yuk."
        noIndex={true}
      />
      {/* 1. Dedicated Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo-event-yuk.png"
              alt="Event Yuk Logo"
              className="h-8 sm:h-9 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#172D46] leading-none">
                Event Yuk
              </span>
              <span className="text-sm font-medium text-slate-400 mt-0.5 leading-none">
                Onboarding Peran
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#172D46] transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>

            <button
              onClick={logout}
              className="text-sm font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-slate-200 hover:border-rose-200"
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
        <section className="relative overflow-hidden rounded-lg bg-brand-navy p-6 sm:p-8 lg:p-10 text-white">
          {/* Subtle Ambient Glow */}

          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-lime text-brand-navy text-sm font-semibold">
              <ShieldCheck aria-hidden="true" className="w-4 h-4" />
              <span>Aktivasi ruang kerja akun</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[1.02]">
              Pilih peran utama akunmu
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-8">
              Halo, <strong className="text-white">{user?.fullName || 'Sobat Event'}</strong>. Setiap akun Event Yuk punya <strong className="text-white">satu peran tetap</strong>. Itu yang menjaga keabsahan kontrak kerja sama (PKS), keamanan dompet Escrow, dan rekam jejak reputasi bisnismu.
            </p>

            {/* 1 Account = 1 Role Callout */}
            <div className="mt-4 p-4 sm:p-5 rounded-lg bg-brand-navy-dark flex items-start gap-3.5 text-base text-slate-100">
              <AlertTriangle aria-hidden="true" className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
              <div className="leading-7">
                <strong className="text-brand-lime">Satu akun, satu peran tetap.</strong> Setelah dikonfirmasi, peran ini tidak bisa diubah ke kategori lain. Kamu langsung mendapat dashboard khusus untuk mengunggah katalog dan bertransaksi lewat PKS yang sah.
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Role Selection Grid */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#172D46] text-white text-sm font-extrabold flex items-center justify-center shrink-0">
                1
              </span>
              <span>Pilih satu peran yang cocok dengan bisnismu</span>
            </h2>
            <span className="text-sm text-slate-500 font-medium pl-9 sm:pl-0">
              Klik satu kartu untuk memilih
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
                  className={`text-left p-5 sm:p-6 rounded-lg sm:rounded-lg border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? role.activeColor + '  scale-[1.01]'
                      : 'bg-white border-transparent hover:border-brand-navy/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`p-2.5 rounded-lg border ${role.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-navy text-white text-sm font-semibold">
                          <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-brand-lime" />
                          <span>Terpilih</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                      )}
                    </div>

                    <h3 className="font-display font-extrabold text-brand-ink text-xl tracking-[-0.02em] leading-snug">
                      {role.title}
                    </h3>

                    <span className="inline-block text-sm font-semibold text-slate-700 mt-1 px-3 py-0.5 rounded-full bg-brand-cream">
                      {role.badge}
                    </span>

                    <p className="text-base text-slate-700 mt-2.5 leading-7 line-clamp-3">
                      {role.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-600">Dashboard:</span>
                    <span className="text-brand-ink text-right">
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
            className="bg-white rounded-lg sm:rounded-lg p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8"
          >
            {/* Header of Form */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-[#172D46] text-white text-sm font-extrabold flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
                  Lengkapi profil dan identitas usaha: {activeDef.title}
                </h2>
              </div>
              <p className="text-sm sm:text-sm text-slate-500 leading-relaxed pl-9">
                Data identitas ini akan dicantumkan secara resmi di lembar dokumen PKS digital dan ditampilkan pada profil publik direktori Event Yuk.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 font-semibold flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Business / Brand Name */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeDef.nameLabel} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Masukkan nama resmi usaha / rental / band / lembaga promotor kamu"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-lg border border-slate-300 text-sm sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition"
                />
              </div>

              {/* City / Region */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#456B39]" />
                  <span>Kota domisili operasional *</span>
                </label>
                <input
                  type="text"
                  required
                  value={cityRegion}
                  onChange={(e) => setCityRegion(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan, Bandung, Surabaya"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-lg border border-slate-300 text-sm sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition"
                />
              </div>

              {/* Phone WhatsApp */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Nomor WhatsApp aktif *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneWa}
                  onChange={(e) => setPhoneWa(e.target.value)}
                  placeholder="+62812xxxxxxx"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-lg border border-slate-300 text-sm sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition"
                />
              </div>

              {/* Category Specialization */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Kategori layanan atau dagangan</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={activeDef.placeholderCategory}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-lg border border-slate-300 text-sm sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition"
                />
              </div>

              {/* Bio / Description */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-800">
                  Deskripsi singkat dan rekam jejak
                </label>
                <textarea
                  rows={3}
                  value={bioDescription}
                  onChange={(e) => setBioDescription(e.target.value)}
                  placeholder="Tuliskan pengalaman, portofolio acara sebelumnya, atau keunggulan layanan yang kamu sediakan..."
                  className="w-full px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-lg border border-slate-300 text-sm sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Agreement Checkbox Card */}
            <label className="flex items-start gap-3.5 p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 cursor-pointer transition">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#172D46] focus:ring-[#172D46] mt-0.5 shrink-0"
              />
              <span className="text-sm text-slate-600 leading-relaxed font-medium">
                Saya mengonfirmasi bahwa <strong className="text-slate-900">{activeDef.title}</strong> adalah peran tetap akun ini. Saya memahami bahwa 1 akun hanya dapat memiliki 1 peran dan tidak dapat dipindahkan setelah formulir aktivasi ini diserahkan.
              </span>
            </label>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/"
                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition text-center sm:text-left order-2 sm:order-1"
              >
                Nanti saja, jelajahi sebagai pengunjung
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-h-12 px-8 rounded-full bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Mengaktifkan peran...</span>
                  </>
                ) : (
                  <>
                    <span>Aktifkan peran dan masuk ke dashboard</span>
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
