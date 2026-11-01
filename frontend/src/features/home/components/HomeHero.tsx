import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { EventItem } from '../../../data/mockEvents';
import { useLanguage } from '../../../context/LanguageContext';
import HomeHeroScene from './HomeHeroScene';

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

export default function HomeHero({ featuredEvent, onOpenCreateEvent }: Props) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      aria-labelledby="home-title"
      className="-mx-5 -my-6 overflow-hidden sm:-mx-8 sm:-my-8 lg:-mx-12 2xl:-mx-16"
    >
      <div className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-brand-navy text-white">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[310px] bg-brand-lime sm:h-[290px] lg:h-[240px]" />

        <h1
          id="home-title"
          className="absolute left-5 top-10 z-30 flex flex-col font-display text-[clamp(3.75rem,9.5vw,9rem)] font-black leading-[0.84] tracking-[-0.075em] text-white sm:left-8 sm:top-14 lg:left-12 2xl:left-16"
        >
          <span>{t('hero.title')}</span>
          <span className="mt-2 text-brand-lime lg:mt-3">{t('hero.titleHighlight')}</span>
        </h1>

        <HomeHeroScene
          description={t('hero.imageAlt')}
          projectName={featuredEvent?.title}
          className="pointer-events-none absolute bottom-[200px] right-[-9%] z-10 w-[112%] max-w-none select-none sm:bottom-[212px] sm:right-[-6%] sm:w-[86%] lg:bottom-[190px] lg:right-[-4%] lg:w-[min(60vw,900px)]"
        />

        <div className="absolute inset-x-0 bottom-0 z-20 flex min-h-[220px] flex-col justify-center gap-5 px-5 py-6 text-brand-ink sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 lg:px-12 2xl:px-16">
          <p className="max-w-[42ch] text-base leading-7 sm:text-lg sm:leading-8">
            {t('hero.desc')}
          </p>

          <button
            type="button"
            onClick={onOpenCreateEvent}
            className="inline-flex min-h-14 w-full items-center justify-between gap-6 bg-brand-navy px-5 text-left text-base font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy sm:w-auto sm:min-w-[250px]"
          >
            <span>{t('hero.ctaExplore')}</span>
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-lime" />
          </button>
        </div>
      </div>

      <div className="bg-brand-lime px-5 py-8 text-brand-ink sm:px-8 sm:py-10 lg:px-12 lg:py-12 2xl:px-16">
        <h2 id="event-journey-title" className="font-display text-xl font-bold tracking-[-0.04em] sm:text-4xl">
          {t('hero.phase.label')}
        </h2>
        <ol
          aria-labelledby="event-journey-title"
          className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10"
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
                <p aria-live="polite" className="mt-2 max-w-[28ch] text-sm leading-6 sm:text-base sm:leading-7">
                  {t(descriptionKey)}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

    </section>
  );
}
