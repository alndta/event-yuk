import { api, ApiError } from '../lib/api';
import React, { useState, useEffect, useRef } from 'react';
import useEnter from '../hooks/useEnter';
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
import { UserRole } from '../types/models';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();

  const [step, setStep] = useState<'SELECT_ROLE' | 'FORM' | 'OTP'>('SELECT_ROLE');
  const stepRef = useRef<HTMLElement>(null);
  useEnter(stepRef, step);
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
      name: t('role.EO.name'),
      badge: t('role.EO.badge'),
      desc: t('role.EO.desc'),
      icon: Calendar,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: [t('role.EO.f1'), t('role.EO.f2'), t('role.EO.f3')],
    },
    {
      id: 'VENDOR',
      name: t('role.VENDOR.name'),
      badge: t('role.VENDOR.badge'),
      desc: t('role.VENDOR.desc'),
      icon: Sliders,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: [t('role.VENDOR.f1'), t('role.VENDOR.f2'), t('role.VENDOR.f3')],
    },
    {
      id: 'TALENT',
      name: t('role.TALENT.name'),
      badge: t('role.TALENT.badge'),
      desc: t('role.TALENT.desc'),
      icon: Music,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: [t('role.TALENT.f1'), t('role.TALENT.f2'), t('role.TALENT.f3')],
    },
    {
      id: 'TENANT',
      name: t('role.TENANT.name'),
      badge: t('role.TENANT.badge'),
      desc: t('role.TENANT.desc'),
      icon: Store,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: [t('role.TENANT.f1'), t('role.TENANT.f2'), t('role.TENANT.f3')],
    },
    {
      id: 'SPONSOR',
      name: t('role.SPONSOR.name'),
      badge: t('role.SPONSOR.badge'),
      desc: t('role.SPONSOR.desc'),
      icon: Building2,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: [t('role.SPONSOR.f1'), t('role.SPONSOR.f2'), t('role.SPONSOR.f3')],
    },
    {
      id: 'CREW',
      name: t('role.CREW.name'),
      badge: t('role.CREW.badge'),
      desc: t('role.CREW.desc'),
      icon: Users,
      color: 'bg-brand-lime-soft text-brand-navy',
      borderColor: 'border-brand-navy',
      features: [t('role.CREW.f1'), t('role.CREW.f2'), t('role.CREW.f3')],
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
      setErrorMessage(t('reg.mismatch'));
      setLoading(false);
      return;
    }

    try {
      const data = await api('/auth/send-otp', { method: 'POST', anonymous: true, body: { email: formData.email } });
      setStep('OTP');
      setOtpCountdown(60);
      setSuccessMessage(`${t('reg.otpSent')} ${formData.email}`);
      if (import.meta.env.DEV && data.otp_preview) setPreviewOtp(data.otp_preview);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : t('reg.sendFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await api('/auth/verify-otp-register', {
        method: 'POST',
        anonymous: true,
        body: {
          full_name: formData.fullName,
          email: formData.email,
          phone_wa: formData.phoneWa || undefined,
          password: formData.password,
          initial_role: formData.primaryRole,
          otp_code: otpCode,
        },
      });
      setSuccessMessage(t('reg.done'));
      await login(formData.email, formData.password);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : t('reg.badOtp'));
    } finally {
      setLoading(false);
    }
  };

  const activeRoleDetail = rolesCatalog.find((r) => r.id === formData.primaryRole)!;

  return (
    <div className="min-h-screen w-full bg-brand-canvas flex flex-col justify-between font-sans">
      <SEOHead
        title={t('reg.01')}
        description={t('reg.02')}
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
              <span>{t('reg.03')}</span>
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
              <span className="hidden sm:inline">{t('reg.04')}</span>
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
              <span className="hidden sm:inline">{t('reg.05')}</span>
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
              <span className="hidden sm:inline">{t('reg.06')}</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-sm text-slate-600">
            <span className="hidden md:inline">{t('reg.haveAccount')} </span>
            <Link to="/login" className="font-semibold text-brand-navy underline underline-offset-4">
              {t('reg.signIn')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={stepRef} className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
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
                <span>{t('reg.07')}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-[-0.03em]">
                {t('reg.08')}
              </h2>
              <p className="text-base text-slate-600 leading-7">
                {t('reg.09')}
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
                  <span>{t('reg.10')}</span>
                </button>
                <div className="flex items-center gap-3 my-4 max-w-md mx-auto">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sm text-slate-600">{t('reg.11')}</span>
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
                <span>{t('reg.12')}</span>
                <ArrowRight aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACCOUNT DETAILS & CREDENTIALS */}
        {step === 'FORM' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <button
                type="button"
                onClick={() => setStep('SELECT_ROLE')}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition mb-3"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                <span>{t('reg.13')}</span>
              </button>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-ink sm:text-4xl">
                {t('reg.14')}
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600">
                {t('reg.15')}
              </p>
            </div>

            {/* Active Role Card Reminder */}
            <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${activeRoleDetail.color}`}>
                  <activeRoleDetail.icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">{t('reg.16')}</div>
                  <div className="font-display text-lg font-extrabold text-brand-ink">{activeRoleDetail.name}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('SELECT_ROLE')}
                className="min-h-11 shrink-0 text-sm font-semibold text-brand-navy underline underline-offset-4"
              >
                {t('reg.17')}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendOtp} className="space-y-5 rounded-lg bg-white p-6 font-sans sm:p-8">
              <div>
                <label htmlFor="reg-fullName" className="mb-2 block text-sm font-semibold text-slate-800">
                  {t('reg.18')}
                </label>
                <div className="relative">
                  <User aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    id="reg-fullName" autoComplete="name" placeholder={t('reg.19')}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-business" className="mb-2 block text-sm font-semibold text-slate-800">
                  {t('reg.20')}
                </label>
                <div className="relative">
                  <Building2 aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    id="reg-business" autoComplete="organization" placeholder={t('reg.21')}
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-email" className="mb-2 block text-sm font-semibold text-slate-800">
                    {t('reg.22')}
                  </label>
                  <div className="relative">
                    <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      id="reg-email" autoComplete="email" placeholder={t('reg.23')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-phone" className="mb-2 block text-sm font-semibold text-slate-800">
                    {t('reg.24')}
                  </label>
                  <div className="relative">
                    <Phone aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      id="reg-phone" autoComplete="tel" placeholder="081234567890"
                      value={formData.phoneWa}
                      onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
                      className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-password" className="mb-2 block text-sm font-semibold text-slate-800">
                    {t('reg.25')}
                  </label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="reg-password" autoComplete="new-password" placeholder={t('reg.26')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-12 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
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

                <div>
                  <label htmlFor="reg-confirm" className="mb-2 block text-sm font-semibold text-slate-800">
                    {t('reg.27')}
                  </label>
                  <div className="relative">
                    <Lock aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      id="reg-confirm" autoComplete="new-password" placeholder={t('reg.28')}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
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
                  className="mt-1 h-5 w-5 rounded border-slate-400 text-brand-navy focus:ring-brand-navy"
                />
                <label htmlFor="agreeTerms" className="cursor-pointer text-base leading-7 text-slate-700">
                  {t('reg.agree1')} <span className="font-semibold text-brand-navy underline underline-offset-4">{t('reg.29')}</span> {t('reg.agree2')} <span className="font-semibold text-brand-navy underline underline-offset-4">{t('reg.30')}</span> {t('reg.agree3')}
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('SELECT_ROLE')}
                  className="min-h-12 rounded-full border-2 border-brand-navy/30 px-6 text-base font-semibold text-brand-ink transition hover:border-brand-navy"
                >
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={loading || !formData.agreeTerms}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-navy px-7 text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RotateCw aria-hidden="true" className="h-5 w-5 animate-spin" />
                      <span>{t('reg.31')}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound aria-hidden="true" className="h-5 w-5" />
                      <span>{t('reg.32')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 'OTP' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-lime text-brand-navy">
                <KeyRound aria-hidden="true" className="h-7 w-7" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-ink">
                {t('reg.33')}
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600">
                {t('reg.enterCode')}{' '}
                <strong className="text-brand-ink">{formData.email}</strong>.
              </p>
            </div>

            {previewOtp && (
              <div className="flex items-center justify-between rounded-lg bg-brand-lime-soft p-4 text-base text-brand-ink">
                <span>{t('reg.34')}</span>
                <span className="font-mono text-xl font-bold tracking-widest text-brand-navy">
                  {previewOtp}
                </span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5 rounded-lg bg-white p-6 font-sans sm:p-8">
              <div>
                <label htmlFor="reg-otp" className="mb-2 block text-center text-sm font-semibold text-slate-800">
                  {t('reg.35')}
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="min-h-16 w-full rounded-lg border-2 border-slate-300 bg-white text-center font-mono text-3xl font-bold tracking-[0.5em] text-slate-900 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                />
              </div>

              {/* Timer & Resend */}
              <div className="text-center text-base text-slate-600">
                {otpCountdown > 0 ? (
                  <span>{t('reg.resendIn')} <strong className="font-mono text-brand-navy">{otpCountdown} {t('reg.seconds')}</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="min-h-11 font-semibold text-brand-navy underline underline-offset-4"
                  >
                    {t('reg.36')}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-navy text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RotateCw aria-hidden="true" className="h-5 w-5 animate-spin" />
                      <span>{t('reg.37')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                      <span>{t('reg.38')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="min-h-11 w-full text-base font-semibold text-slate-600 hover:text-slate-950"
                >
                  {t('reg.39')}
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
            <span>{t('reg.40')}</span>
          </div>
          <div>© {new Date().getFullYear()} Event Yuk. Seluruh data terenkripsi dan terlindungi.</div>
        </div>
      </footer>
    </div>
  );
}