import { useState, useEffect, useRef } from 'react';
import useGsapReveal from '../hooks/useGsapReveal';
import {
  Building2,
  CheckCircle2,
  Send,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { EventItem } from '../types/models';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  events?: EventItem[];
  onApplySponsorship?: (event: EventItem, tier: string, budget: string) => void;
}

export default function SponsorHubPage({ events, onApplySponsorship }: Props) {
  const { t } = useLanguage();
  const availableEvents = (events || []).filter(e => !e.isPortfolio);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | undefined>(availableEvents[0]);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef);

  useEffect(() => {
    setSelectedTier('');
  }, [selectedEvent?.id]);

  useEffect(() => {
    if (availableEvents.length > 0) {
      setSelectedEvent(availableEvents[0]);
    }
  }, [events]);

  const TIER_COLOR: Record<string, string> = {
    TITLE: 'border-[#172D46] bg-gradient-to-b from-[#172D46]/10 to-transparent',
    PLATINUM: 'border-[#172D46] bg-gradient-to-b from-[#172D46]/5 to-transparent',
    GOLD: 'border-[#5E7628] bg-gradient-to-b from-[#5E7628]/5 to-transparent',
  };
  // Real packages the organizer listed for this event; nothing is invented here.
  const sponsorshipTiers = (selectedEvent?.sponsorshipPackages ?? []).map((x) => ({
    id: x.tier,
    name: x.name,
    price: 'Rp ' + x.price.toLocaleString('id-ID'),
    price_value: x.price,
    badge: x.slotsLeft + ' ' + t('spn.slotsLeft'),
    deliverables: x.benefits,
    color: TIER_COLOR[x.tier] ?? 'border-slate-300 bg-white',
  }));

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onApplySponsorship && selectedEvent) {
      onApplySponsorship(selectedEvent, selectedTier, customBudget);
    }
    setProposalSubmitted(true);
    setTimeout(() => setProposalSubmitted(false), 5000);
  };

  const inputClass =
    'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30';

  if (!selectedEvent) {
    return <EmptyState title={t('spn.01')} body={t('spn.emptyBody')} actionLabel={t('spn.seeEvents')} actionTo="/events" />;
  }

  return (
    <div ref={pageRef} className="space-y-16 font-sans sm:space-y-20">
      <SEOHead
        title={t('spn.02')}
        description={t('spn.03')}
        keywords="sponsor pensi sekolah, sponsorship konser musik, paket aktivasi brand festival, proposal sponsorship jakarta, brand activation event"
        canonicalPath="/sponsors"
      />

      <header className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
          <Building2 aria-hidden="true" className="h-4 w-4" />
          {t('spn.04')}
        </p>
        <h1 data-split-title className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-brand-ink sm:text-6xl">
          Sponsor Hub
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          {t('spn.05')}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5">
        <div data-gsap-reveal className="flex flex-col justify-between rounded-lg bg-white p-6 sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
              {t('spn.06')}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{t('spn.07')}</p>

            <ul className="mt-5 space-y-3">
              {availableEvents.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    aria-pressed={selectedEvent.id === ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                      selectedEvent.id === ev.id
                        ? 'border-brand-navy bg-brand-lime-soft'
                        : 'border-slate-200 hover:border-brand-navy/50'
                    }`}
                  >
                    <img
                      src={ev.bannerImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 shrink-0 rounded-md bg-brand-navy-light object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-brand-ink">{ev.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar aria-hidden="true" className="h-4 w-4 shrink-0" />
                        {ev.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-lg bg-brand-cream p-4">
            <p className="text-sm text-slate-700">{t('spn.08')}</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-display text-lg font-extrabold text-brand-ink">
              {selectedEvent.organizer.name}
              <CheckCircle2 aria-label={t('spn.09')} className="h-5 w-5 text-brand-forest" />
            </p>
            <p className="mt-1 text-sm text-slate-600">{t('spn.10')}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="sponsor-tiers-title">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="sponsor-tiers-title"
            data-split-title
            className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-brand-ink sm:text-5xl"
          >
            {t('spn.11')}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            {t('spn.12')}
          </p>
        </div>

        {sponsorshipTiers.length === 0 && (
          <p className="mt-8 rounded-lg bg-white p-6 text-base leading-7 text-slate-700">{t('spn.noPackages')}</p>
        )}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {sponsorshipTiers.map((tier) => {
            const selected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                data-gsap-reveal
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                onClick={() => setSelectedTier(tier.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTier(tier.id);
                  }
                }}
                className={`flex cursor-pointer flex-col justify-between rounded-lg border-2 p-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy ${
                  selected ? 'border-brand-navy bg-brand-lime' : 'border-transparent bg-white hover:border-brand-navy/40'
                }`}
              >
                <div>
                  <span className="inline-block rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
                    {tier.badge}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-extrabold leading-tight tracking-[-0.03em] text-brand-ink">
                    {tier.name}
                  </h3>
                  <p className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-ink">
                    {tier.price}
                  </p>

                  <div className="mt-5 border-t border-brand-navy/15 pt-5">
                    <p className="text-sm font-semibold text-brand-ink">{t('spn.13')}</p>
                    <ul className="mt-3 space-y-2.5">
                      {tier.deliverables.map((deliv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm leading-6 text-slate-800">
                          <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-forest" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className={`mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold ${
                    selected ? 'bg-brand-navy text-white' : 'bg-brand-cream text-brand-ink'
                  }`}
                >
                  {selected ? 'Paket terpilih' : 'Pilih paket ini'}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sponsor-form-title" data-gsap-reveal className="rounded-lg bg-white p-6 sm:p-10">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-lime-strong">
            <Send aria-hidden="true" className="h-4 w-4" />
            {t('spn.14')}
          </p>
          <h2
            id="sponsor-form-title"
            className="font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-ink sm:text-4xl"
          >
            {t('spn.15')}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Kamu mengajukan sponsorship untuk <strong className="text-brand-ink">{selectedEvent.title}</strong> dengan paket{' '}
            <strong className="text-brand-ink">{selectedTier || t('spn.customTier')}</strong>. {t('spn.terms')}
          </p>
        </div>

        {proposalSubmitted ? (
          <div role="status" className="mt-8 rounded-lg bg-brand-forest-light p-8 text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto mb-3 h-10 w-10 text-brand-forest" />
            <p className="font-display text-xl font-extrabold text-brand-forest-dark">{t('spn.16')}</p>
            <p className="mx-auto mt-2 max-w-md text-base leading-7 text-slate-700">
              {t('spn.17')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleProposalSubmit} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="sponsor-brand" className="mb-2 block text-sm font-semibold text-slate-800">
                {t('spn.18')}
              </label>
              <input
                id="sponsor-brand"
                type="text"
                required
                placeholder={t('spn.19')}
                value={customBrandName}
                onChange={(e) => setCustomBrandName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sponsor-budget" className="mb-2 block text-sm font-semibold text-slate-800">
                {t('spn.20')}
              </label>
              <input
                id="sponsor-budget"
                type="number"
                required
                min={0}
                inputMode="numeric"
                placeholder={t('spn.21')}
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sponsor-notes" className="mb-2 block text-sm font-semibold text-slate-800">
                {t('spn.22')}
              </label>
              <textarea
                id="sponsor-notes"
                rows={4}
                placeholder={t('spn.23')}
                className={inputClass + ' py-3'}
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-forest" />
                {t('spn.24')}
              </p>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-navy px-7 text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
              >
                <Send aria-hidden="true" className="h-5 w-5" />
                {t('spn.25')}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
