import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';
import type { TranslationKey } from '../i18n/translations';
import {
  Calendar,
  Sliders,
  Music,
  Store,
  Building2,
  Users,
  ShieldCheck,
  LayoutDashboard,
  DollarSign,
  FileCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { UserRole } from '../types/models';

interface Props {
  currentRole: UserRole;
  onOpenCreateEvent?: () => void;
  onOpenUploadPortfolio?: () => void;
}

export default function RoleContextBar({
  currentRole,
  onOpenCreateEvent,
  onOpenUploadPortfolio,
}: Props) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [figures, setFigures] = useState<{ open: number; funded: number; escrow: number; balance: number } | null>(null);

  // Real numbers from the account itself; nothing here is a sample.
  useEffect(() => {
    Promise.all([api('/proposals'), api('/payments/wallet')])
      .then(([proposals, wallet]) => {
        const list: { status: string }[] = proposals.data || [];
        setFigures({
          open: list.filter((p) => p.status === 'SUBMITTED' || p.status === 'COUNTER_OFFER').length,
          funded: list.filter((p) => p.status === 'ESCROW_FUNDED').length,
          escrow: Number(wallet.wallet.escrow_locked) || 0,
          balance: Number(wallet.wallet.available_bal) || 0,
        });
      })
      .catch(() => setFigures(null));
  }, [currentRole]);

  const ICONS = { EO: Calendar, VENDOR: Sliders, TALENT: Music, TENANT: Store, SPONSOR: Building2, CREW: Users } as const;
  const RoleIcon = ICONS[currentRole];
  const key = (field: string) => `rcb.${currentRole}.${field}` as TranslationKey;
  const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
  const primaryAction =
    currentRole === 'EO' ? onOpenCreateEvent || (() => navigate('/dashboard')) : currentRole === 'TENANT' || currentRole === 'CREW' || currentRole === 'SPONSOR' ? () => navigate('/events') : () => navigate('/dashboard');

  const stats = figures
    ? [
        { label: t('rcb.sActive'), value: String(figures.open), icon: FileCheck },
        { label: t('rcb.sFunded'), value: String(figures.funded), icon: ShieldCheck },
        { label: t('rcb.sEscrow'), value: rupiah(figures.escrow), icon: Clock },
        { label: t('rcb.sBalance'), value: rupiah(figures.balance), icon: DollarSign },
      ]
    : [];

  return (
    <div data-gsap-reveal className="rounded-lg bg-brand-navy p-6 text-white sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime px-3 py-1 text-sm font-semibold text-brand-navy">
              <RoleIcon aria-hidden="true" className="h-4 w-4" />
              <span>{t(key('title'))}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-brand-lime" />
              <span>{t('rcb.fixed')}</span>
            </span>
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{t('rcb.heading')}</h2>
          <p className="max-w-xl text-base leading-7 text-slate-200">
            {t(key('badge'))}. {t('rcb.tail')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/40 px-6 text-base font-semibold text-white transition-colors hover:border-white"
          >
            <LayoutDashboard aria-hidden="true" className="h-5 w-5 text-brand-lime" />
            <span>{t('rcb.dashboard')}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>

          {currentRole === 'EO' && onOpenUploadPortfolio && (
            <button
              type="button"
              onClick={onOpenUploadPortfolio}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/40 px-6 text-base font-semibold text-white transition-colors hover:border-white"
            >
              <FileCheck aria-hidden="true" className="h-5 w-5 text-brand-lime" />
              <span>{t('rcb.portfolio')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={primaryAction}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-lime px-6 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-lime-hover"
          >
            <span>{t(key('action'))}</span>
          </button>
        </div>
      </div>

      {stats.length > 0 && (
        <dl className="ey-fade-in mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-6 md:grid-cols-4">
          {stats.map((s) => {
            const SIcon = s.icon;
            return (
              <div key={s.label} className="rounded-lg bg-brand-navy-dark p-4">
                <dt className="mb-1 flex items-center gap-2 text-sm text-slate-300">
                  <SIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-lime" />
                  <span>{s.label}</span>
                </dt>
                <dd className="font-display text-xl font-extrabold tracking-[-0.02em] text-white tabular-nums">{s.value}</dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}
