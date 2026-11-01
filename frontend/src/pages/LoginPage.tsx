import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromLocation = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.activeRole) {
        const dest = fromLocation && fromLocation !== '/' && fromLocation !== '/login' ? fromLocation : '/dashboard';
        navigate(dest, { replace: true });
      } else {
        navigate('/onboarding-role', { replace: true });
      }
    } else {
      setErrorMessage(result.error || 'Email atau kata sandi tidak sesuai.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans">
      <SEOHead
        title="Masuk ke Akun Mitra | Event Yuk"
        description="Masuk ke ruang kerja kolaborasi acara Event Yuk untuk mengelola pagu anggaran, kontrak PKS sah, dan rekening bersama Escrow."
        noIndex={true}
      />
      {/* Left Column: Visual Brand Showcase (Desktop 50%) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 overflow-hidden">
        {/* Real Concert Festival Imagery with Vignette */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero-concert.jpg"
            alt="Panggung Festival Event Yuk"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-[#172D46]/60" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950/90" />
        </div>

        {/* Ambient Color Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#172D46]/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#456B39]/25 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 hover:scale-105 transition"
          >
            <img
              src="/logo-event-yuk.png"
              alt="Logo Event Yuk"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Editorial Narrative */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#5E7628] text-xs font-bold border border-white/15">
            <ShieldCheck className="w-4 h-4 text-[#5E7628]" />
            <span>Ekosistem Acara Terintegrasi #1 di Indonesia</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Satu Akun Terpadu.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#5E7628] via-[#456B39] to-[#5E7628]">
              Semua Mitra Terproteksi Escrow.
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Akses ruang kerja profesional untuk Event Organizer, Vendor Peralatan, Musisi & Band, Tenant Kuliner, Brand Sponsor, dan Kru Lapangan.
          </p>

          {/* Core Guarantees */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Rekening Bersama Escrow Berizin Bank Indonesia (Midtrans)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <FileCheck className="w-4 h-4" />
              </div>
              <span>Perjanjian Kerjasama (PKS) Digital Sah & Unggah Berkas Mandiri</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <div className="p-1.5 rounded-lg bg-[#5E7628]/20 text-[#5E7628] border border-[#5E7628]/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Pencairan Dana Berbasis BAST Digital & Presensi QR GPS</span>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-slate-400">
          <p className="italic">
            "Sistem Escrow dan PKS digital Event Yuk menghilangkan risiko sengketa DP dan memberi kepastian penuh bagi semua pihak."
          </p>
          <div className="mt-2 font-bold text-slate-200">
            Nusantara Live Kreasi — Festival & Concert Organizer
          </div>
        </div>
      </div>

      {/* Right Column: Clean White Authentication Form (Desktop 50%, Mobile 100%) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top Header: Return Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-extrabold text-[#456B39] hover:underline"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>

        {/* Center Form Card */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <Link to="/" className="inline-block">
              <img
                src="/logo-event-yuk.png"
                alt="Event Yuk"
                className="h-10 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Masukkan email dan kata sandi akun Anda untuk mengakses dasbor proyek, proposal kerjasama, dan dompet escrow.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="nama@perusahaan.com / nama@band.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">Kata Sandi</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi tim support di support@eventyuk.id untuk reset kata sandi.');
                  }}
                  className="text-[11px] text-[#456B39] hover:underline font-bold"
                >
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#172D46] focus:border-transparent focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Sembunyikan' : 'Lihat'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#172D46] focus:ring-[#172D46]"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                Ingat sesi saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#172D46] to-[#0F263B] hover:from-[#0F263B] hover:to-[#0B1F31] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Dasbor</span>
                </>
              )}
            </button>
          </form>

          {/* Social / SSO Divider */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <button
              type="button"
              onClick={async () => {
                const res = await signInWithGoogle();
                if (res && !res.success) {
                  setErrorMessage(res.error || 'Google SSO memerlukan Google OAuth Client ID.');
                }
              }}
              className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 transition text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
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
              <span>Lanjutkan dengan Google SSO</span>
            </button>
          </div>
        </div>

        {/* Bottom Trust & Security Note */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Koneksi Aman Terenkripsi TLS 1.3 & SHA-256</span>
          </div>
          <div>© {new Date().getFullYear()} Event Yuk Ecosystem. Hak Cipta Dilindungi.</div>
        </div>
      </div>
    </div>
  );
}