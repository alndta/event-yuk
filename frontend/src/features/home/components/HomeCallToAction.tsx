import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import useMagnetic from '../../../hooks/useMagnetic';
import Band from './Band';

interface Props {
  onOpenCreateEvent: () => void;
}

export default function HomeCallToAction({ onOpenCreateEvent }: Props) {
  const { t } = useLanguage();
  const ctaRef = useMagnetic<HTMLButtonElement>();

  return (
    <Band tone="bg-brand-lime text-brand-navy" className="sm:!py-32">
      <section aria-labelledby="home-cta-title" data-gsap-reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h2
          id="home-cta-title"
          data-split-title
          className="font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-8xl"
        >
          {t('cta.title')}
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9">{t('cta.desc')}</p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            ref={ctaRef}
            type="button"
            onClick={onOpenCreateEvent}
            className="inline-flex min-h-14 items-center gap-3 rounded-full bg-brand-navy px-8 text-base font-semibold text-brand-lime transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
          >
            {t('cta.btnPrimary')}
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </button>
          <Link
            to="/events"
            className="inline-flex min-h-14 items-center rounded-full border-2 border-brand-navy px-7 text-base font-semibold transition-colors hover:bg-brand-navy hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
          >
            {t('cta.btnSecondary')}
          </Link>
        </div>
      </section>
    </Band>
  );
}
