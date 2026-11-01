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
  Check,
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

  const inputClass =
    'w-full min-h-12 rounded-lg border border-slate-300 bg-white py-3 pl-11 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30';

  const guarantees = [
    'Rekening bersama Escrow berizin Bank Indonesia (Midtrans)',
    'Perjanjian kerja sama (PKS) digital, atau unggah dokumenmu sendiri',
    'Dana cair lewat BAST digital dan presensi QR GPS',
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-sans lg:flex-row">
      <SEOHead
        title="Masuk ke Akun Mitra | Event Yuk"
        description="Masuk ke ruang kerja kolaborasi acara Event Yuk untuk mengelola pagu anggaran, kontrak PKS sah, dan rekening bersama Escrow."
        noIndex={true}
      />

      <aside className="hidden flex-col justify-between bg-brand-navy p-12 text-white lg:flex lg:w-1/2 lg:p-16">
        <Link
          to="/"
          className="inline-flex w-fit items-center rounded-lg bg-white px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-lime"
        >
          <img src="/logo-event-yuk.png" alt="Event Yuk" className="h-9 w-auto object-contain" />
        </Link>

        <div className="max-w-lg">
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.03em]">
            Satu akun,
            <span className="mt-2 block text-brand-lime">semua peran di acaramu.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-200">
            Masuk untuk mengelola proyek, kontrak, dan pembayaran, baik sebagai penyelenggara, vendor, musisi, tenant, sponsor, maupun kru.
          </p>
          <ul className="mt-8 space-y-4">
            {guarantees.map((item) => (
              <li key={item} className="flex items-start gap-3 text-base leading-7 text-slate-100">
                <Check aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-brand-lime" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="h-1.5 w-16 bg-brand-lime" />
      </aside>

      <main className="flex min-h-screen w-full flex-col justify-between p-6 sm:p-12 lg:w-1/2 lg:p-16">
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-slate-700 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali ke beranda
          </Link>
          <p className="text-slate-600">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-navy underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              Daftar gratis
            </Link>
          </p>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-10">
          <Link to="/" className="mb-8 block lg:hidden">
            <img src="/logo-event-yuk.png" alt="Event Yuk" className="mx-auto h-10 w-auto object-contain" />
          </Link>

          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
            Masuk ke akunmu
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Pakai email dan kata sandi untuk membuka dasbor proyek, proposal kerja sama, dan dompet escrow.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-center gap-3 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm font-medium text-rose-800"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-800">
                Email
              </label>
              <div className="relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass + ' pr-4'}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
                  Kata sandi
                </label>
                <button
                  type="button"
                  onClick={() => alert('Silakan hubungi tim support di support@eventyuk.id untuk reset kata sandi.')}
                  className="min-h-11 text-sm font-semibold text-brand-navy underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Kata sandi akunmu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-slate-600 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-navy"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label htmlFor="remember" className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-slate-700">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded border-slate-400 text-brand-navy focus:ring-brand-navy"
              />
              Ingat saya di perangkat ini
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-navy px-5 text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RotateCw aria-hidden="true" className="h-5 w-5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn aria-hidden="true" className="h-5 w-5" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <button
              type="button"
              onClick={async () => {
                const res = await signInWithGoogle();
                if (res && !res.success) {
                  setErrorMessage(res.error || 'Google SSO memerlukan Google OAuth Client ID.');
                }
              }}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Lanjutkan dengan Google
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row">
          <p className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-forest" />
            Koneksi terenkripsi TLS 1.3 &amp; SHA-256
          </p>
          <p>© {new Date().getFullYear()} Event Yuk. Seluruh hak cipta dilindungi.</p>
        </div>
      </main>
    </div>
  );
}
