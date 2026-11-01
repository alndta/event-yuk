import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  Globe,
  Layers,
  LogOut,
  Menu,
  PlusCircle,
  User,
  X,
} from 'lucide-react';
import { UserRole } from './RoleOnboardingModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  currentRole: UserRole;
  onOpenRoleModal?: () => void;
  onOpenCreateEvent: () => void;
  onOpenUploadPortfolio?: () => void;
}

// Pages whose first section is a full-bleed colour field the header sits on top of.
const LIME_HERO_ROUTES = ['/'];
const NAVY_HERO_ROUTES = ['/panduan-role', '/roles-guide'];

export default function Navbar({ onOpenCreateEvent, onOpenUploadPortfolio }: Props) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const overlay = LIME_HERO_ROUTES.includes(location.pathname) || NAVY_HERO_ROUTES.includes(location.pathname);
  const onNavy = NAVY_HERO_ROUTES.includes(location.pathname);
  const solid = scrolled || menuOpen;
  const light = onNavy && !solid;
  const isHome = LIME_HERO_ROUTES.includes(location.pathname);
  // Line the logo up with the content below it on each kind of page.
  const shellClass = isHome
    ? 'mx-auto max-w-[96rem] px-5 sm:px-8 lg:px-12'
    : onNavy
      ? ''
      : 'px-5 sm:px-8 lg:px-12 2xl:px-16';
  const shellStyle = onNavy ? { paddingInline: 'clamp(1.25rem, 4.5vw, 5rem)' } : undefined;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Modal behaviour: lock page scroll, close on Escape, keep Tab inside, return focus on close.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [menuOpen]);

  const textTone = light ? 'text-white' : 'text-brand-navy';
  const pill =
    'inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ';

  const primary = [
    { to: '/', label: t('nav.home'), tone: 'bg-brand-cream text-brand-navy hover:bg-white' },
    { to: '/events', label: t('nav.events'), tone: 'bg-brand-lime text-brand-navy hover:bg-brand-lime-hover' },
    { to: '/contracts', label: t('nav.contracts'), tone: 'bg-brand-cream text-brand-navy hover:bg-white' },
    { to: '/panduan-role', label: t('nav.guide'), tone: 'bg-brand-lime text-brand-navy hover:bg-brand-lime-hover' },
  ];
  const partners = [
    { to: '/vendors', label: t('nav.vendors') },
    { to: '/bands', label: t('nav.bands') },
    { to: '/organizers', label: t('nav.organizers') },
    { to: '/sponsors', label: t('nav.sponsors') },
  ];
  const isHere = (to: string) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <>
      <header
        className={
          'sticky top-0 z-40 h-16 font-sans transition-colors duration-200 ' +
          (overlay ? '-mb-16 ' : '') +
          (solid ? 'bg-brand-canvas/90 backdrop-blur ' : 'bg-transparent ') +
          (solid ? 'border-b border-brand-navy/10 ' : 'border-b border-transparent ')
        }
      >
        <div
          style={shellStyle}
          className={'flex h-full w-full items-center justify-between gap-3 ' + shellClass}
        >
          <Link
            to="/"
            className={'flex shrink-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ' + textTone}
          >
            <img src="/logo-event-yuk.png" alt="" className="h-9 w-auto object-contain" />
            <span className="font-display text-xl font-extrabold leading-none tracking-[-0.03em]">Event Yuk</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className={'inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-current ' + textTone}
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              aria-label={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <Globe aria-hidden="true" className="h-4 w-4" />
              {language.toUpperCase()}
            </button>

            {!isAuthenticated && (
              <Link
                to="/register"
                className={
                  pill +
                  'hidden sm:inline-flex ' +
                  (light
                    ? 'bg-brand-lime text-brand-navy hover:bg-brand-lime-hover focus-visible:outline-white'
                    : 'bg-brand-navy text-brand-lime hover:bg-brand-navy-dark focus-visible:outline-brand-navy')
                }
              >
                {t('nav.register')}
              </Link>
            )}

            {isAuthenticated && user?.activeRole && (
              <Link
                to="/dashboard"
                className={
                  pill +
                  'hidden sm:inline-flex ' +
                  (light
                    ? 'bg-brand-lime text-brand-navy hover:bg-brand-lime-hover focus-visible:outline-white'
                    : 'bg-brand-navy text-brand-lime hover:bg-brand-navy-dark focus-visible:outline-brand-navy')
                }
              >
                <Layers aria-hidden="true" className="h-4 w-4" />
                {t('nav.dashboard')}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className={
                pill +
                'border-2 ' +
                (light
                  ? 'border-white text-white hover:bg-white hover:text-brand-navy focus-visible:outline-white'
                  : 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-lime focus-visible:outline-brand-navy')
              }
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
              Menu
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu utama"
          className="fixed inset-0 z-50 flex animate-fadeIn flex-col overflow-y-auto bg-brand-navy font-sans text-white"
        >
          <div className="mx-auto flex w-full max-w-[96rem] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
            <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-lime">
              <img src="/logo-event-yuk.png" alt="" className="h-9 w-auto rounded-md bg-white p-1 object-contain" />
              <span className="font-display text-xl font-extrabold leading-none tracking-[-0.03em]">Event Yuk</span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              className={pill + 'bg-brand-lime text-brand-navy hover:bg-brand-lime-hover focus-visible:outline-white'}
            >
              <X aria-hidden="true" className="h-5 w-5" />
              Tutup
            </button>
          </div>

          <div className="mx-auto grid w-full max-w-[96rem] flex-1 grid-cols-1 gap-x-8 gap-y-6 px-5 pb-8 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:grid-rows-[minmax(0,1fr)_auto] lg:px-12">
            <nav aria-label="Menu utama" className="flex flex-col gap-2 lg:row-span-2">
              {primary.map(({ to, label, tone }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={isHere(to) ? 'page' : undefined}
                  className={
                    'group flex min-h-[4.5rem] items-center justify-between rounded-lg px-6 lg:flex-1 font-display text-[clamp(2rem,4.4vw,3.75rem)] font-extrabold leading-none tracking-[-0.04em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-[5.5rem] ' +
                    tone
                  }
                >
                  <span className="flex items-center gap-4">
                    {label}
                    {isHere(to) && <span aria-hidden="true" className="h-3 w-3 rounded-full bg-brand-navy" />}
                  </span>
                  <ArrowUpRight aria-hidden="true" className="h-8 w-8 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-10 sm:w-10" />
                </Link>
              ))}

              <p className="mt-4 text-base font-semibold text-slate-300">{t('nav.partners')}</p>
              <ul className="grid grid-cols-2 gap-2">
                {partners.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      aria-current={isHere(to) ? 'page' : undefined}
                      className="group flex min-h-16 items-center justify-between gap-2 rounded-lg border-2 border-white/25 px-4 font-display text-lg font-bold tracking-[-0.02em] transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-xl"
                    >
                      <span className="flex items-center gap-2">
                        {label}
                        {isHere(to) && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-brand-lime" />}
                      </span>
                      <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="relative hidden min-h-[14rem] overflow-hidden rounded-lg bg-brand-navy-light lg:block">
              <img
                src="/assets/hero-concert.jpg"
                alt=""
                width={1200}
                height={800}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3 rounded-lg bg-brand-navy-dark p-5">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className={pill + 'justify-center border-2 border-white/40 text-white hover:border-white focus-visible:outline-white'}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className={pill + 'justify-center bg-brand-lime text-brand-navy hover:bg-brand-lime-hover focus-visible:outline-white'}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              ) : (
                <>
                  {!user?.activeRole && (
                    <Link
                      to="/onboarding-role"
                      className={pill + 'w-full justify-center bg-brand-lime text-brand-navy hover:bg-brand-lime-hover focus-visible:outline-white'}
                    >
                      <AlertCircle aria-hidden="true" className="h-5 w-5" />
                      {t('nav.completeRole')}
                    </Link>
                  )}
                  {user?.activeRole && (
                    <Link
                      to="/dashboard"
                      className={pill + 'w-full justify-center bg-brand-lime text-brand-navy hover:bg-brand-lime-hover focus-visible:outline-white'}
                    >
                      <Layers aria-hidden="true" className="h-5 w-5" />
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  {user?.activeRole === 'EO' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenCreateEvent();
                        }}
                        className={pill + 'w-full justify-center border-2 border-white/40 text-white hover:border-white focus-visible:outline-white'}
                      >
                        <PlusCircle aria-hidden="true" className="h-5 w-5" />
                        {t('nav.createEvent')}
                      </button>
                      {onOpenUploadPortfolio && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onOpenUploadPortfolio();
                          }}
                          className={pill + 'w-full justify-center text-slate-200 hover:text-white focus-visible:outline-white'}
                        >
                          Unggah portofolio acara
                        </button>
                      )}
                    </>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/profile"
                      className={pill + 'justify-center border-2 border-white/40 text-white hover:border-white focus-visible:outline-white'}
                    >
                      <User aria-hidden="true" className="h-5 w-5" />
                      <span className="max-w-[7rem] truncate">{user?.fullName?.split(' ')[0] || 'Profil'}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className={pill + 'justify-center border-2 border-white/40 text-white hover:border-white focus-visible:outline-white'}
                    >
                      <LogOut aria-hidden="true" className="h-5 w-5" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={toggleLanguage}
                className={pill + 'w-full justify-center text-slate-200 hover:text-white focus-visible:outline-white'}
              >
                <Globe aria-hidden="true" className="h-5 w-5" />
                {language === 'id' ? 'Bahasa Indonesia' : 'English'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
