import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  onOpenCreateEvent: () => void;
}

export default function HomeCallToAction({ onOpenCreateEvent }: Props) {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="home-cta-title" data-gsap-reveal className="bg-brand-navy px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
      <div className="max-w-3xl">
        <h2 id="home-cta-title" className="max-w-[16ch] font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
          {t('cta.title')}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg sm:leading-8">{t('cta.desc')}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onOpenCreateEvent}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t('cta.btnPrimary')}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
          <Link
            to="/events"
            className="inline-flex min-h-12 items-center justify-center px-6 py-3 text-sm font-semibold text-white underline underline-offset-4 transition hover:text-brand-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t('cta.btnSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
