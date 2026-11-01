import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EventItem } from '../../../types/models';
import { useLanguage } from '../../../context/LanguageContext';
import { gsap, NO_REDUCED_MOTION } from '../../../lib/motion';
import useMagnetic from '../../../hooks/useMagnetic';

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

/** Spiky badge outline, built once so the markup stays readable. */
function burstPoints(spikes: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push((50 + r * Math.cos(a)).toFixed(2) + ',' + (50 + r * Math.sin(a)).toFixed(2));
  }
  return pts.join(' ');
}
const BURST = burstPoints(14, 49, 40);

/** Scalloped edge that hands the lime field over to the navy section below. */
function scallopPath() {
  const period = 180;
  let d = 'M0 90 L0 44';
  for (let x = 0; x < 1440; x += period) {
    d += ` Q${x + period / 4} 0 ${x + period / 2} 44 T${x + period} 44`;
  }
  return d + ' L1440 90 Z';
}
const SCALLOP = scallopPath();

const BLOB =
  'M120 300 C80 160 240 60 400 90 C560 120 720 80 760 240 C800 400 640 540 460 540 C300 540 160 460 120 300 Z';

export default function HomeHero({ onOpenCreateEvent }: Props) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const ctaRef = useMagnetic<HTMLButtonElement>();

  // Opening sequence. States are set before the first paint, so nothing flashes.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED_MOTION, () => {
      const q = gsap.utils.selector(root);

      gsap
        .timeline({ defaults: { ease: 'ey' } })
        .from(q('[data-hero-line]'), { yPercent: 115, duration: 1.3, stagger: 0.12 })
        .from(q('[data-hero-wave]'), { yPercent: 100, duration: 1.2 }, 0.15)
        .from(q('[data-hero-fade]'), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.5)
        .from(q('[data-hero-photo]'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4 }, 0.35)
        .from(q('[data-hero-photo] img'), { scale: 1.45, duration: 1.8 }, 0.35)
        .from(q('[data-hero-sticker]'), { scale: 0, rotate: -40, duration: 1, ease: 'back.out(2.2)', stagger: 0.14 }, 1.0)
        .from(q('[data-hero-step]'), { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.9);

      // Idle life: the badge turns, stickers hover, the blob drifts.
      gsap.to(q('[data-hero-spin]'), { rotate: 360, duration: 36, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      gsap.to(q('[data-hero-sticker]'), {
        y: -9,
        duration: 3.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.6, from: 'random' },
      });
      gsap.to(q('[data-hero-blob]'), { x: 26, y: -14, scale: 1.06, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // As the hero leaves, the photo rises a little faster than the page and the blob lags behind.
      gsap.to(q('[data-hero-photo-wrap]'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to(q('[data-hero-blob]'), {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="home-title"
      className="-mx-5 -my-6 overflow-hidden sm:-mx-8 sm:-my-8 lg:-mx-12 2xl:-mx-16"
    >
      <div className="relative isolate overflow-hidden bg-brand-lime text-brand-navy">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 600"
          data-hero-blob
          className="absolute -left-24 -bottom-8 -z-10 h-[24rem] w-[34rem] text-brand-lime-hover lg:-left-10 lg:h-[30rem] lg:w-[42rem]"
        >
          <path d={BLOB} fill="currentColor" />
        </svg>

        <div className="relative z-10 mx-auto max-w-[96rem] px-5 pt-24 sm:px-8 lg:min-h-[31rem] lg:px-12 lg:pb-24">
          <h1
            id="home-title"
            className="font-display text-[clamp(2.9rem,7.4vw,7.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em]"
          >
            <span className="-mx-[0.05em] -mb-[0.08em] block overflow-hidden px-[0.05em] pb-[0.08em]">
              <span data-hero-line className="block">
                {t('hero.title')}
              </span>
            </span>
            <span className="-mx-[0.05em] -mb-[0.08em] block overflow-hidden px-[0.05em] pb-[0.08em]">
              <span
                data-hero-line
                className="block text-white [-webkit-text-stroke:clamp(2px,0.26vw,4px)_#172D46] [paint-order:stroke_fill]"
              >
                {t('hero.titleHighlight')}
              </span>
            </span>
          </h1>

          <div className="relative z-30 mt-6 max-w-[34rem] lg:mt-9">
            <p data-hero-fade className="font-display text-lg font-bold leading-7">{t('hero.desc')}</p>
            <div data-hero-fade className="mt-5 flex flex-wrap items-center gap-3">
              <button
                ref={ctaRef}
                type="button"
                onClick={onOpenCreateEvent}
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-brand-navy px-7 text-base font-semibold text-brand-lime transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
              >
                {t('hero.ctaExplore')}
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </button>
              <Link
                to="/events"
                className="inline-flex min-h-12 items-center rounded-full border-2 border-brand-navy px-6 text-base font-semibold transition-colors hover:bg-brand-navy hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
              >
                {t('hero.ctaOpportunities')}
              </Link>
            </div>
          </div>
        </div>

        <div data-hero-photo-wrap className="relative z-20 mx-auto mt-8 w-[72%] max-w-[20rem] lg:absolute lg:bottom-0 lg:right-[7%] lg:mx-0 lg:mt-0 lg:w-[min(24vw,23rem)] lg:max-w-none">
          <div data-hero-photo className="aspect-[4/5] overflow-hidden rounded-t-[999px] bg-brand-navy-light">
            <img
              src="/assets/crowd-festival.jpg"
              alt={t('hero.photoAlt')}
              width={800}
              height={533}
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="h-full w-full select-none object-cover"
            />
          </div>

          <div data-hero-sticker className="absolute -left-[16%] top-[22%] w-[34%] max-w-[7.5rem] -rotate-[8deg]">
            <svg data-hero-spin aria-hidden="true" viewBox="0 0 100 100" className="block w-full text-brand-navy">
              <polygon points={BURST} fill="currentColor" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-display text-[clamp(0.65rem,1.2vw,1rem)] font-extrabold uppercase leading-[1.05] text-brand-lime">
              PKS
              <br />
              digital
            </span>
          </div>

          <span data-hero-sticker className="absolute -right-[14%] top-[10%] rotate-[11deg] rounded-md bg-brand-navy px-3 py-1.5 font-display text-[clamp(0.65rem,1.1vw,0.95rem)] font-extrabold uppercase leading-none text-white sm:px-4 sm:py-2">
            Escrow Midtrans
          </span>

          <svg
            data-hero-sticker
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="absolute -right-[6%] bottom-[28%] w-[14%] text-white"
          >
            <path
              d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z"
              fill="currentColor"
              stroke="#172D46"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <svg
          data-hero-wave
          aria-hidden="true"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="relative z-40 -mb-px block h-10 w-full text-brand-navy sm:h-14"
        >
          <path d={SCALLOP} fill="currentColor" />
        </svg>
      </div>

      <div className="bg-brand-navy px-5 pb-10 pt-3 text-white sm:px-8 sm:pb-12 lg:px-12 lg:pb-14 2xl:px-16">
        <div className="mx-auto max-w-[96rem]">
          <h2 id="event-journey-title" className="font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            {t('hero.phase.label')}
          </h2>
          <ol
            aria-labelledby="event-journey-title"
            className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10"
          >
            {workflowSteps.map(([titleKey, descriptionKey], index) => (
              <li key={titleKey} data-hero-step>
                <button
                  type="button"
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className={`block min-h-12 w-full border-t-[6px] pt-4 text-left font-display text-lg font-bold tracking-[-0.03em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-lime sm:text-xl ${activeStep === index ? 'border-brand-lime text-white' : 'border-white/25 text-slate-300 hover:border-white/60 hover:text-white'}`}
                >
                  {t(titleKey)}
                </button>
                {activeStep === index && (
                  <p aria-live="polite" className="mt-2 max-w-[28ch] text-base leading-7 text-slate-200">
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
