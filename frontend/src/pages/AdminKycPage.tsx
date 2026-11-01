import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/Spinner';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError } from '../lib/api';

interface Pending {
  user_id: string;
  full_name: string;
  email: string;
  submitted_at: string;
}
interface Photo {
  kind: 'KTP' | 'SELFIE';
  url: string;
}

/** Review queue for e-KYC submissions. The backend enforces who may open it; this page just hides itself. */
export default function AdminKycPage({ onShowToast }: { onShowToast?: (msg: string) => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rows, setRows] = useState<Pending[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    api('/admin/kyc/pending')
      .then((res) => {
        setRows(res.data || []);
        setError(null);
      })
      .catch((err) => {
        setRows([]);
        setError(err instanceof ApiError ? err.message : t('admin.loadFail'));
      });
  }, [t]);

  useEffect(() => {
    if (user?.isAdmin) load();
  }, [user?.isAdmin, load]);

  if (!user?.isAdmin) {
    return <EmptyState title={t('admin.forbidden')} body={t('admin.forbiddenBody')} actionLabel={t('nav.home')} actionTo="/" />;
  }
  if (rows === null) return <LoadingState />;

  const togglePhotos = async (id: string) => {
    if (photos[id]) {
      setPhotos(({ [id]: _drop, ...rest }) => rest);
      return;
    }
    setBusy(id);
    try {
      const res = await api(`/admin/kyc/${id}/documents`);
      setPhotos((p) => ({ ...p, [id]: res.data }));
    } catch (err) {
      onShowToast?.(err instanceof ApiError ? err.message : t('admin.loadFail'));
    } finally {
      setBusy(null);
    }
  };

  const decide = async (id: string, decision: 'VERIFIED' | 'UNVERIFIED') => {
    setBusy(id);
    try {
      await api(`/admin/users/${id}/kyc`, { method: 'POST', body: decision === 'VERIFIED' ? { decision } : { decision, reason: reason.trim() } });
      onShowToast?.(decision === 'VERIFIED' ? t('admin.approved') : t('admin.rejected'));
      setRejecting(null);
      setReason('');
      load();
    } catch (err) {
      onShowToast?.(err instanceof ApiError ? err.message : t('admin.loadFail'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans">
      <SEOHead title={t('admin.title') + ' | Event Yuk'} description={t('admin.lead')} noIndex={true} />
      <div>
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          {t('nav.kycReview')}
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-brand-ink sm:text-5xl">{t('admin.title')}</h1>
        <p className="mt-3 text-lg leading-8 text-slate-700">{t('admin.lead')}</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      {rows.length === 0 && !error ? (
        <EmptyState title={t('admin.emptyTitle')} body={t('admin.emptyBody')} icon={<CheckCircle2 aria-hidden="true" className="h-7 w-7" />} />
      ) : (
        <ul className="ey-stagger space-y-4">
          {rows.map((r) => (
            <li key={r.user_id} className="rounded-lg bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-extrabold text-brand-ink">{r.full_name}</p>
                  <p className="truncate text-sm text-slate-600">{r.email}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('admin.submitted')} {new Date(r.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => togglePhotos(r.user_id)}
                    disabled={busy === r.user_id}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-brand-navy/30 px-5 text-sm font-semibold text-brand-ink hover:border-brand-navy"
                  >
                    {busy === r.user_id && <Spinner size="sm" />}
                    {photos[r.user_id] ? t('admin.hidePhotos') : t('admin.viewPhotos')}
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(r.user_id, 'VERIFIED')}
                    disabled={busy === r.user_id}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-navy-dark"
                  >
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-brand-lime" />
                    {t('admin.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejecting(rejecting === r.user_id ? null : r.user_id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-rose-200 px-5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle aria-hidden="true" className="h-4 w-4" />
                    {t('admin.reject')}
                  </button>
                </div>
              </div>

              {photos[r.user_id] && (
                <div className="ey-fade-in mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {photos[r.user_id].map((p) => (
                    <figure key={p.kind} className="overflow-hidden rounded-lg bg-brand-cream">
                      <img src={p.url} alt={p.kind === 'KTP' ? t('admin.photoKtp') : t('admin.photoSelfie')} className="h-64 w-full object-contain" />
                      <figcaption className="px-3 py-2 text-sm font-semibold text-slate-700">{p.kind === 'KTP' ? t('admin.photoKtp') : t('admin.photoSelfie')}</figcaption>
                    </figure>
                  ))}
                </div>
              )}

              {rejecting === r.user_id && (
                <form
                  className="ey-fade-in mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void decide(r.user_id, 'UNVERIFIED');
                  }}
                >
                  <label htmlFor={`reason-${r.user_id}`} className="block text-sm font-semibold text-slate-800">
                    {t('admin.reason')}
                  </label>
                  <textarea
                    id={`reason-${r.user_id}`}
                    required
                    minLength={3}
                    maxLength={300}
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('admin.reasonPh')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={busy === r.user_id} className="min-h-11 rounded-full bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800">
                      {t('admin.confirmReject')}
                    </button>
                    <button type="button" onClick={() => setRejecting(null)} className="min-h-11 rounded-full px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      {t('admin.cancel')}
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
