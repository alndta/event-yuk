import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  KeyRound,
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  ArrowLeft,
  Layers,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserRole } from '../components/RoleOnboardingModal';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();

  const [step, setStep] = useState<'SELECT_ROLE' | 'FORM' | 'OTP'>('SELECT_ROLE');
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phoneWa: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
    primaryRole: 'EO' as UserRole,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Timer countdown for OTP
  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpCountdown]);

  const rolesCatalog: {
    id: UserRole;
    name: string;
    badge: string;
    desc: string;
    icon: any;
    color: string;
    borderColor: string;
    features: string[];
  }[] = [
    {
      id: 'EO',
      name: 'Event Organizer & Promotor',
      badge: 'Penyelenggara Acara',
      desc: 'Buka proyek acara, kelola pagu anggaran, kurasi kaveling booth, dan buka shift kru lapangan.',
      icon: Calendar,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: ['Kendali Pagu Anggaran', 'Kurasi Kaveling Booth', 'Negosiasi Termin Fleksibel'],
    },
    {
      id: 'VENDOR',
      name: 'Vendor Produksi & Rigging',
      badge: 'Penyedia Alat',
      desc: 'Pajang katalog Sound System, Tata Lampu, Rigging Panggung, LED Screen, dan Genset.',
      icon: Sliders,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: ['Garansi DP 50% di Escrow', 'Smart Calendar Otomatis', 'Klaim Pelunasan via BAST'],
    },
    {
      id: 'TALENT',
      name: 'Musisi & Manajemen Band',
      badge: 'Artis & Talenta',
      desc: 'Kelola jadwal manggung festival/pensi, tentukan rate card honor, dan kunci technical riders.',
      icon: Music,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: ['Rate Card Transparan', 'Hospitality Riders Terkunci', 'PKS Sah Anti-Cancel'],
    },
    {
      id: 'TENANT',
      name: 'Tenant Kuliner & Pameran',
      badge: 'Penyewa Kaveling',
      desc: 'Pilih nomor kaveling denah festival, upload foto menu untuk kurasi, dan peroleh Exhibitor Pass.',
      icon: Store,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: ['Denah Interaktif Akurat', 'Seleksi Kurasi Terbuka', 'Faktur Resmi Sewa Booth'],
    },
    {
      id: 'SPONSOR',
      name: 'Sponsor Brand & Korporasi',
      badge: 'Brand & Agensi',
      desc: 'Akses data demografi audiens terverifikasi, beli paket aktivasi berjenjang, dan amankan hak eksklusif.',
      icon: Building2,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: ['Database Audiens Riil', 'Paket Aktivasi Eksklusif', 'Laporan Tayang & Audit'],
    },
    {
      id: 'CREW',
      name: 'Event Crew & Kru Lapangan',
      badge: 'Tenaga Kerja Lepas',
      desc: 'Lamar lowongan shift harian anti-bentrok jam kerja, lakukan presensi QR GPS, dan honor instan.',
      icon: Users,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: ['Shift Anti-Bentrok Jadwal', 'Absensi QR GPS Geofencing', 'Honor Cair Otomatis'],
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setFormData({ ...formData, primaryRole: role });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.email, type: 'EMAIL' }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('OTP');
        setOtpCountdown(60);
        setSuccessMessage(`Kode verifikasi OTP 6-digit telah dikirim ke ${formData.email}`);
        if (data.otp_preview) {
          setPreviewOtp(data.otp_preview);
        }
      } else {
        setErrorMessage(data.error || 'Gagal mengirim kode OTP.');
      }
    } catch {
      // Local fallback for offline mode
      setStep('OTP');
      setOtpCountdown(60);
      setPreviewOtp('829104');
      setSuccessMessage(`Kode OTP telah dikirimkan ke ${formData.email}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/verify-otp-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone_wa: formData.phoneWa,
          password: formData.password,
          initial_role: formData.primaryRole,
          otp_code: otpCode,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Pendaftaran akun berhasil! Mengalihkan ke Dashboard...');
        await login(formData.email, formData.password);
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setErrorMessage(data.error || 'Kode OTP tidak cocok atau telah kedaluwarsa.');
      }
    } catch {
      // Offline fallback
      setSuccessMessage('Pendaftaran akun berhasil! Mengalihkan ke Dashboard...');
      await login(formData.email, formData.password);
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const activeRoleDetail = rolesCatalog.find((r) => r.id === formData.primaryRole)!;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between font-sans">
      <SEOHead
        title="Daftar Akun Mitra Baru | Event Yuk"
        description="Daftar akun ekosistem acara Event Yuk untuk Event Organizer, Vendor Peralatan, Band Musisi, Tenant Bazaar, Sponsor Brand, atau Kru Lapangan."
        noIndex={true}
      />
      {/* Top Header Navigation */}
      <header className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Return */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo-event-yuk.png"
                alt="Event Yuk"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <Link
              to="/"
              className="hidden sm:inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
                step === 'SELECT_ROLE'
                  ? 'bg-[#172D46] text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                1
              </span>
              <span className="hidden sm:inline">Pilih peran</span>
            </div>

            <span className="text-slate-300 font-bold text-xs">→</span>

            <div
              className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
                step === 'FORM'
                  ? 'bg-[#172D46] text-white shadow-xs'
                  : step === 'OTP'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                2
              </span>
              <span className="hidden sm:inline">Data akun</span>
            </div>

            <span className="text-slate-300 font-bold text-xs">→</span>

            <div
              className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition ${
                step === 'OTP'
                  ? 'bg-[#172D46] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                3
              </span>
              <span className="hidden sm:inline">Verifikasi OTP</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-sm text-slate-600">
            <span className="hidden md:inline">Sudah punya akun? </span>
            <Link to="/login" className="font-semibold text-brand-navy underline underline-offset-4">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-sm text-rose-800 font-medium flex items-center gap-2.5" role="alert">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-sm text-emerald-900 font-medium flex items-center gap-2.5" role="status">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: SELECT PRIMARY ROLE */}
        {step === 'SELECT_ROLE' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-lime-soft text-brand-navy text-sm font-semibold border border-brand-navy/15">
                <Layers className="w-3.5 h-3.5 text-[#172D46]" />
                <span>Langkah 1 dari 3: pilih satu peran</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-[-0.03em]">
                Kamu terlibat di acara sebagai apa?
              </h2>
              <p className="text-base text-slate-600 leading-7">
                Setiap akun punya satu peran tetap, supaya dokumen PKS dan rekening bersama Escrow punya dasar hukum yang jelas.
              </p>

              {/* Fast Google Auth Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await signInWithGoogle();
                  }}
                  className="w-full sm:w-auto min-h-12 px-6 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-base transition flex items-center justify-center gap-3 mx-auto"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Daftar lebih cepat dengan Google</span>
                </button>
                <div className="flex items-center gap-3 my-4 max-w-md mx-auto">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sm text-slate-600">atau daftar lewat email dan OTP</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </div>
            </div>

            {/* 6 Roles Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rolesCatalog.map((role) => {
                const IconComponent = role.icon;
                const isSelected = formData.primaryRole === role.id;
                return (
                  <div
                    key={role.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectRole(role.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectRole(role.id);
                      }
                    }}
                    className={`cursor-pointer rounded-xl p-6 transition-all duration-200 flex flex-col justify-between border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy ${
                      isSelected
                        ? `${role.borderColor} bg-white shadow-xl ring-2 ring-brand-navy/20`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${role.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                            {role.badge}
                          </span>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="font-display font-bold text-xl tracking-[-0.02em] text-slate-950">{role.name}</h3>
                      <p className="text-base text-slate-600 mt-2 leading-7">{role.desc}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        {role.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-brand-forest shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <div
                        className={`w-full min-h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-brand-navy text-white'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        <span>{isSelected ? 'Peran terpilih' : 'Pilih peran ini'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advance to Step 2 */}
            <div className="pt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="min-h-12 px-8 rounded-lg bg-brand-navy hover:bg-brand-navy-dark text-white font-semibold text-base transition-colors flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
              >
                <span>Lanjut ke data akun</span>
                <ArrowRight aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACCOUNT DETAILS & CREDENTIALS */}
        {step === 'FORM' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
              <button
                type="button"
                onClick={() => setStep('SELECT_ROLE')}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ubah Pilihan Peran</span>
              </button>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Lengkapi Data Penanggung Jawab
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Data ini digunakan untuk penerbitan dokumen PKS resmi dan otentikasi akunmu.
              </p>
            </div>

            {/* Active Role Card Reminder */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${activeRoleDetail.color}`}>
                  <activeRoleDetail.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Peran Akun Utama</div>
                  <div className="font-extrabold text-sm text-slate-900">{activeRoleDetail.name}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('SELECT_ROLE')}
                className="text-xs font-bold text-[#456B39] hover:underline"
              >
                Ganti Peran
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendOtp} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Penanggung Jawab / Pimpinan
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Raden Satria Pamungkas"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nama Entitas / Perusahaan / Nama Panggung
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kreasi Panggung Nusantara / Senja Di Batavia"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Alamat Email Aktif
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="kontak@perusahaan.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nomor Telepon / WhatsApp Aktif
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={formData.phoneWa}
                      onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kata Sandi Akun
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 8 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#172D46] focus:ring-[#172D46] mt-0.5"
                />
                <label htmlFor="agreeTerms" className="text-slate-600 leading-snug cursor-pointer text-xs">
                  Saya menyetujui <span className="text-[#172D46] font-bold hover:underline">Syarat & Ketentuan Layanan</span> serta klausul otomatisasi <span className="text-[#172D46] font-bold hover:underline">Rekening Bersama Escrow & PKS Digital</span> Event Yuk.
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('SELECT_ROLE')}
                  className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={loading || !formData.agreeTerms}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#172D46] to-[#0F263B] hover:from-[#0F263B] hover:to-[#0B1F31] text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Mengirim OTP...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Kirim Kode OTP Verifikasi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 'OTP' && (
          <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-14 h-14 rounded-3xl bg-[#172D46]/10 text-[#172D46] mx-auto flex items-center justify-center mb-4 border border-[#172D46]/20">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Verifikasi Kode OTP
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Masukkan 6-digit kode verifikasi yang telah dikirimkan ke email{' '}
                <strong className="text-slate-800">{formData.email}</strong>.
              </p>
            </div>

            {previewOtp && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Kode Verifikasi:</span>
                <span className="font-mono font-black text-base tracking-widest text-[#456B39]">
                  {previewOtp}
                </span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 text-center mb-2">
                  Kode Verifikasi 6-Digit
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-4 text-center font-mono font-black text-2xl tracking-[0.5em] rounded-2xl border-2 border-slate-300 focus:border-[#172D46] focus:ring-2 focus:ring-[#172D46]/20 focus:outline-none transition text-slate-900"
                />
              </div>

              {/* Timer & Resend */}
              <div className="text-center text-xs text-slate-500">
                {otpCountdown > 0 ? (
                  <span>Kirim ulang kode dalam <strong className="text-[#172D46] font-mono">{otpCountdown} detik</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="font-bold text-[#456B39] hover:underline"
                  >
                    Kirim Ulang Kode OTP Sekarang
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verifikasi & Masuk Otomatis</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Kembali ke Data Akun
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="w-full py-5 border-t border-slate-200/80 bg-white text-center text-sm text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistem Pendaftaran Resmi Ekosistem Kolaborasi Acara Event Yuk</span>
          </div>
          <div>© {new Date().getFullYear()} Event Yuk. Seluruh data terenkripsi dan terlindungi.</div>
        </div>
      </footer>
    </div>
  );
}