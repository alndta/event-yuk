import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Spinner } from '../components/Spinner';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError } from '../lib/api';

const field =
  'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30';

/** Two steps: ask for a code by email, then set a new password with it. */
export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const ask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api('/auth/forgot-password', { method: 'POST', anonymous: true, body: { email } });
      setNote(t('fp.sentNote'));
      if (import.meta.env.DEV && res.otp_preview) setPreview(res.otp_preview);
      setStep('RESET');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('fp.sending'));
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/auth/reset-password', { method: 'POST', anonymous: true, body: { email, otp_code: code, new_password: password } });
      navigate('/login', { replace: true, state: { notice: t('fp.done') } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('fp.saving'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brand-canvas px-5 py-10 font-sans">
      <SEOHead title={t('fp.seoTitle')} description={t('fp.lead1')} noIndex={true} />
      <div className="ey-fade-in w-full max-w-md rounded-lg bg-white p-6 sm:p-8">
        <Link to="/login" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t('fp.back')}
        </Link>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-lime-soft text-brand-navy">
          <KeyRound aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-ink">{t('fp.title')}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{step === 'EMAIL' ? t('fp.lead1') : t('fp.lead2')}</p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {error}
          </p>
        )}
        {note && step === 'RESET' && (
          <p role="status" className="mt-5 rounded-lg bg-brand-sand px-4 py-3 text-sm text-slate-700">
            {note}
            {preview && <strong className="ml-2 font-mono text-brand-navy">{preview}</strong>}
          </p>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={ask} className="mt-6 space-y-4">
            <label htmlFor="fp-email" className="block text-sm font-semibold text-slate-800">{t('fp.email')}</label>
            <input id="fp-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="nama@email.com" />
            <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-5 text-base font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-60">
              {busy && <Spinner size="sm" />}
              {busy ? t('fp.sending') : t('fp.sendCode')}
            </button>
          </form>
        ) : (
          <form onSubmit={save} className="mt-6 space-y-4">
            <label htmlFor="fp-code" className="block text-sm font-semibold text-slate-800">{t('fp.code')}</label>
            <input id="fp-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className={field + ' tracking-[0.4em] tabular-nums'} />
            <label htmlFor="fp-pass" className="block text-sm font-semibold text-slate-800">{t('fp.newPassword')}</label>
            <input id="fp-pass" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} placeholder={t('fp.minChars')} />
            <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-5 text-base font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-60">
              {busy && <Spinner size="sm" />}
              {busy ? t('fp.saving') : t('fp.save')}
            </button>
            <button type="button" onClick={() => ask()} disabled={busy} className="min-h-11 w-full text-sm font-semibold text-brand-navy underline underline-offset-4">
              {t('fp.resend')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
