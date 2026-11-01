import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { gsap, NO_REDUCED_MOTION } from '../lib/motion';
import { useLanguage } from '../context/LanguageContext';

const linkClass = 'text-sm leading-6 text-slate-300 transition-colors hover:text-white';

export default function Footer() {
  const { t } = useLanguage();
  const footerRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    const mark = markRef.current;
    if (!footer || !mark) return;
    const mm = gsap.matchMedia();
    mm.add(NO_REDUCED_MOTION, () => {
      gsap.fromTo(
        mark,
        { yPercent: 38 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <footer ref={footerRef} className="mt-20 overflow-hidden bg-brand-ink text-slate-200">
      <div className="bg-brand-navy px-5 py-7 sm:px-8 lg:px-12 2xl:px-16">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-white">
              {t('footer.escrowTitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white">
              {t('footer.escrowDesc')}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white">
            <span>{t('footer.escrowTag')}</span>
            <span>{t('footer.kycTag')}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 2xl:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <img src="/logo-event-yuk.png" alt="" className="h-10 w-auto object-contain" />
              <span className="text-lg font-semibold text-white">Event Yuk</span>
            </Link>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              {t('footer.about')}
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-lime" />
                Jakarta Selatan, DKI Jakarta 12190
              </p>
              <p className="flex items-center gap-2">
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-lime" />
                kerjasama@eventyuk.id
              </p>
            </div>
          </div>

          <nav aria-label={t('footer.explore')}>
            <h3 className="mb-4 text-base font-semibold text-white">{t('footer.explore')}</h3>
            <ul className="space-y-2">
              <li><Link to="/events" className={linkClass}>{t('footer.projects')}</Link></li>
              <li><Link to="/organizers" className={linkClass}>{t('footer.organizers')}</Link></li>
              <li><Link to="/bands" className={linkClass}>{t('footer.bands')}</Link></li>
              <li><Link to="/vendors" className={linkClass}>{t('footer.vendors')}</Link></li>
              <li><Link to="/sponsors" className={linkClass}>{t('footer.sponsors')}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t('footer.account')}>
            <h3 className="mb-4 text-base font-semibold text-white">{t('footer.account')}</h3>
            <ul className="space-y-2">
              <li><Link to="/profile" className={linkClass}>{t('footer.profile')}</Link></li>
              <li><Link to="/contracts" className={linkClass}>{t('footer.contracts')}</Link></li>
              <li><Link to="/login" className={linkClass}>{t('footer.login')}</Link></li>
              <li><Link to="/register" className={linkClass}>{t('footer.register')}</Link></li>
              <li>
                <a href="/api-docs" target="_blank" rel="noreferrer" className={linkClass}>
                  {t('footer.apiDocs')}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Event Yuk. {t('footer.rights')}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span>{t('footer.terms')}</span>
            <span>{t('footer.privacy')}</span>
            <span>{t('footer.arbitration')}</span>
          </div>
        </div>

        <p
          ref={markRef}
          aria-hidden="true"
          className="mt-12 select-none overflow-hidden whitespace-nowrap text-center font-display text-[clamp(4.5rem,21vw,22rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-white/10"
        >
          Event Yuk
        </p>
      </div>
    </footer>
  );
}
