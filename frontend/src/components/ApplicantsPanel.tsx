import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Users, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError } from '../lib/api';
import { Spinner } from './Spinner';

interface Applicant {
  id: string;
  name: string;
  status: string;
  event_title: string;
  label: string;
  detail: string | null;
}

const PENDING = new Set(['PENDING', 'APPLIED']);

/** For organizers: who asked for a booth or a shift, with a way to accept or decline. */
export default function ApplicantsPanel({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useLanguage();
  const [data, setData] = useState<{ tenants: Applicant[]; crew: Applicant[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  // The page passes a new toast function on every render; keep the latest one without re-running the load.
  const toast = useRef(onToast);
  toast.current = onToast;

  const load = useCallback(() => {
    api('/events/applications')
      .then((res) => setData(res.data))
      .catch((err) => {
        setData({ tenants: [], crew: [] });
        toast.current(err instanceof ApiError ? err.message : t('apl.loadFail'));
      });
  }, [t]);

  useEffect(load, [load]);

  const decide = async (kind: 'tenant' | 'crew', id: string, approve: boolean) => {
    setBusy(id);
    try {
      await api(`/events/applications/${kind}/${id}`, { method: 'POST', body: { decision: approve ? 'APPROVE' : 'REJECT' } });
      toast.current(t('apl.doneOk'));
      load();
    } catch (err) {
      toast.current(err instanceof ApiError ? err.message : t('apl.loadFail'));
    } finally {
      setBusy(null);
    }
  };

  const badge = (status: string) =>
    PENDING.has(status)
      ? { text: t('apl.pending'), cls: 'bg-amber-100 text-amber-900' }
      : status === 'REJECTED'
        ? { text: t('apl.rejected'), cls: 'bg-rose-100 text-rose-900' }
        : { text: t('apl.approved'), cls: 'bg-brand-forest-light text-brand-forest-dark' };

  const list = (kind: 'tenant' | 'crew', rows: Applicant[]) =>
    rows.length === 0 ? (
      <p className="rounded-lg bg-brand-cream px-4 py-3 text-sm text-slate-600">{t('apl.empty')}</p>
    ) : (
      <ul className="space-y-2">
        {rows.map((r) => {
          const b = badge(r.status);
          return (
            <li key={r.id} className="flex flex-col gap-3 rounded-lg bg-brand-cream p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold text-brand-ink">
                  {r.label} <span className="font-normal text-slate-600">· {r.name}</span>
                </p>
                <p className="truncate text-sm text-slate-600">
                  {r.event_title}
                  {r.detail ? ` · ${r.detail}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${b.cls}`}>{b.text}</span>
                {PENDING.has(r.status) && (
                  <>
                    <button
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => decide(kind, r.id, true)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-navy px-4 text-sm font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-60"
                    >
                      {busy === r.id ? <Spinner size="sm" /> : <Check aria-hidden="true" className="h-4 w-4 text-brand-lime" />}
                      {t('apl.approve')}
                    </button>
                    <button
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => decide(kind, r.id, false)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-rose-200 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                      {t('apl.reject')}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );

  return (
    <section className="space-y-5 rounded-lg bg-white p-6 sm:p-8" aria-labelledby="applicants-title">
      <div>
        <h2 id="applicants-title" className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
          <Users aria-hidden="true" className="h-6 w-6 text-brand-navy" />
          {t('apl.title')}
        </h2>
        <p className="mt-1 text-base text-slate-600">{t('apl.lead')}</p>
      </div>
      {data === null ? (
        <div className="flex justify-center py-6 text-brand-navy">
          <Spinner />
        </div>
      ) : (
        <div className="ey-fade-in space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t('apl.tenants')}</h3>
            {list('tenant', data.tenants)}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t('apl.crew')}</h3>
            {list('crew', data.crew)}
          </div>
        </div>
      )}
    </section>
  );
}
