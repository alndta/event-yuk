import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, MapPin } from 'lucide-react';
import { EventItem } from '../../../data/mockEvents';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  featuredEvent?: EventItem;
  onOpenCreateEvent: () => void;
}

const workflowSteps = [
  ['hero.phase.plan', 'hero.phase.planDescription'],
  ['hero.phase.prepare', 'hero.phase.prepareDescription'],
  ['hero.phase.live', 'hero.phase.liveDescription'],
  ['hero.phase.finish', 'hero.phase.finishDescription'],
] as const;

function ProjectPanel({ event }: { event: EventItem }) {
  const { t } = useLanguage();
  const progress = event.progress;
  const completion = Math.min(100, Math.max(0, progress?.vendorFilled ?? 0));

  return (
    <article
      aria-label={event.title}
      className="w-full max-w-[34rem] overflow-hidden rounded-lg bg-white text-brand-ink"
    >
      <div className="aspect-[16/8] bg-brand-navy-light">
        <img
          src={event.bannerImage}
          alt=""
          width={1200}
          height={600}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-sm font-semibold text-brand-lime-strong">{t('eventCard.openStatus')}</p>
        <h2 className="mt-1 font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[1.7rem]">
          {event.title}
        </h2>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-4 w-4" />
            {event.venue}
          </span>
        </p>

        {progress && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-medium text-slate-800">{progress.stage}</p>
              <p className="shrink-0 font-display text-2xl font-bold">
                {completion}%
                <span className="ml-1 text-sm font-medium text-slate-600">{t('eventCard.filled')}</span>
              </p>
            </div>
            <div
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('eventCard.progressLabel')}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-sand"
            >
              <div className="h-full rounded-full bg-brand-navy" style={{ width: completion + '%' }} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-600">{t('eventCard.boothCount')}</dt>
                <dd className="font-display text-xl font-bold">{progress.boothFilled}</dd>
              </div>
              <div>
                <dt className="text-slate-600">{t('eventCard.crewCount')}</dt>
                <dd className="font-display text-xl font-bold">{progress.crewNeeded}</dd>
              </div>
            </dl>
          </div>
        )}

        <ul className="mt-6 space-y-2 border-t border-slate-200 pt-5 text-sm text-slate-700">
          {(['hero.card.pksReady', 'hero.card.escrowReady'] as const).map((key) => (
            <li key={key} className="flex items-center gap-2.5">
              <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-forest" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function HomeHero({ featuredEvent, onOpenCreateEvent }: Props) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      aria-labelledby="home-title"
      className="-mx-5 -my-6 overflow-hidden sm:-mx-8 sm:-my-8 lg:-mx-12 2xl:-mx-16"
    >
      <div className="bg-brand-navy px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24 2xl:px-16">
        <div
          className={
            'mx-auto grid max-w-[88rem] items-center gap-12 lg:gap-16 ' +
            (featuredEvent ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]' : '')
          }
        >
          <div>
            <h1
              id="home-title"
              className="font-display text-[clamp(3rem,6.4vw,6.25rem)] font-extrabold leading-[0.98] tracking-[-0.035em]"
            >
              {t('hero.title')}
              <span className="block text-brand-lime">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="mt-6 max-w-[34ch] text-lg leading-8 text-slate-200 sm:text-xl sm:leading-9">
              {t('hero.desc')}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7">
              <button
                type="button"
                onClick={onOpenCreateEvent}
                className="inline-flex min-h-14 items-center justify-between gap-6 bg-brand-lime px-6 text-left text-base font-semibold text-brand-navy transition-colors hover:bg-brand-lime-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-w-[15rem]"
              >
                <span>{t('hero.ctaExplore')}</span>
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </button>
              <Link
                to="/events"
                className="inline-flex min-h-12 items-center text-base font-semibold text-white underline decoration-brand-lime decoration-2 underline-offset-8 transition-colors hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {t('hero.ctaOpportunities')}
              </Link>
            </div>
          </div>

          {featuredEvent && (
            <div className="lg:justify-self-end">
              <ProjectPanel event={featuredEvent} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-brand-lime px-5 py-10 text-brand-ink sm:px-8 sm:py-12 lg:px-12 lg:py-14 2xl:px-16">
        <div className="mx-auto max-w-[88rem]">
          <h2 id="event-journey-title" className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-4xl">
            {t('hero.phase.label')}
          </h2>
          <ol
            aria-labelledby="event-journey-title"
            className="mt-7 grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10"
          >
            {workflowSteps.map(([titleKey, descriptionKey], index) => (
              <li key={titleKey}>
                <button
                  type="button"
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className={`block min-h-12 w-full border-t-[6px] pt-4 text-left font-display text-lg font-bold tracking-[-0.03em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy sm:text-xl ${activeStep === index ? 'border-brand-navy text-brand-navy' : 'border-brand-navy/25 text-brand-ink hover:border-brand-navy/60'}`}
                >
                  {t(titleKey)}
                </button>
                {activeStep === index && (
                  <p aria-live="polite" className="mt-2 max-w-[28ch] text-base leading-7">
                    {t(descriptionKey)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
