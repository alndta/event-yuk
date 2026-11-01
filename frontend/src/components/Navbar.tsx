import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Music,
  Sliders,
  Store,
  Building2,
  Users,
  LogIn,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  AlertCircle,
  ChevronDown,
  Globe,
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

export default function Navbar({
  currentRole,
  onOpenCreateEvent,
  onOpenUploadPortfolio,
}: Props) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on route changes
  useEffect(() => {
    setPartnersOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPartnersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'EO':
        return { label: 'Event Organizer', icon: Calendar, color: 'text-brand-navy bg-brand-navy/5 border-brand-navy/15' };
      case 'VENDOR':
        return { label: 'Vendor Produksi', icon: Sliders, color: 'text-brand-navy bg-brand-navy/5 border-brand-navy/15' };
      case 'TALENT':
        return { label: 'Manajemen Band', icon: Music, color: 'text-brand-navy bg-brand-navy/5 border-brand-navy/15' };
      case 'TENANT':
        return { label: 'Tenant Bazaar', icon: Store, color: 'text-brand-navy bg-brand-navy/5 border-brand-navy/15' };
      case 'SPONSOR':
        return { label: 'Mitra Sponsor', icon: Building2, color: 'text-brand-navy bg-brand-navy/5 border-brand-navy/15' };
      case 'CREW':
        return { label: 'Kru Lapangan', icon: Users, color: 'text-brand-navy bg-brand-navy/5 border-brand-navy/15' };
    }
  };

  const activeRole = user?.activeRole || currentRole;
  const roleInfo = activeRole ? getRoleBadge(activeRole) : null;
  const RoleIcon = roleInfo ? roleInfo.icon : null;

  const isPartnerActive = ['/vendors', '/bands', '/organizers', '/sponsors'].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <header className="sticky top-0 z-40 bg-white font-sans">
      <div className="w-full px-5 sm:px-8 lg:px-12 2xl:px-16">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* 1. Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo-event-yuk.png"
              alt="Event Yuk Logo"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-brand-navy leading-none">
                Event Yuk
              </span>
              <span className="mt-1 text-[13px] font-medium leading-none text-slate-600">
                Ekosistem Industri Acara
              </span>
            </div>
          </Link>

          {/* 2. Main Desktop Navigation Links (Compact & Non-overflowing) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                location.pathname === '/'
                  ? 'text-brand-navy underline decoration-2 underline-offset-[1.35rem]'
                  : 'text-slate-700 hover:text-brand-navy'
              }`}
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/events"
              className={`px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                location.pathname.startsWith('/events')
                  ? 'text-brand-navy underline decoration-2 underline-offset-[1.35rem]'
                  : 'text-slate-700 hover:text-brand-navy'
              }`}
            >
              {t('nav.events')}
            </Link>

            {/* Dropdown: Direktori Mitra (Consolidates Vendor, Band, EO, Sponsor) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setPartnersOpen(true)}
              onMouseLeave={() => setPartnersOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPartnersOpen(!partnersOpen)}
                className={`px-3 py-2 text-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isPartnerActive
                    ? 'text-brand-navy underline decoration-2 underline-offset-[1.35rem]'
                    : 'text-slate-700 hover:text-brand-navy'
                }`}
              >
                <span>{t('nav.partners')}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    partnersOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {partnersOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg animate-fadeIn">
                  <Link
                    to="/vendors"
                    className="flex items-center gap-3 px-3.5 py-3 text-sm text-slate-700 transition hover:bg-brand-canvas hover:text-brand-navy"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-navy">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t('nav.vendors')}</p>
                      <p className="text-xs font-normal text-slate-600">Sound, Stage, Lighting, LED</p>
                    </div>
                  </Link>

                  <Link
                    to="/bands"
                    className="flex items-center gap-3 px-3.5 py-3 text-sm text-slate-700 transition hover:bg-brand-canvas hover:text-brand-navy"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-navy">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t('nav.bands')}</p>
                      <p className="text-xs font-normal text-slate-600">Indie Bands, Soloists, MCs</p>
                    </div>
                  </Link>

                  <Link
                    to="/organizers"
                    className="flex items-center gap-3 px-3.5 py-3 text-sm text-slate-700 transition hover:bg-brand-canvas hover:text-brand-navy"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-navy">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t('nav.organizers')}</p>
                      <p className="text-xs font-normal text-slate-600">Concert & Festival Promoters</p>
                    </div>
                  </Link>

                  <Link
                    to="/sponsors"
                    className="flex items-center gap-3 px-3.5 py-3 text-sm text-slate-700 transition hover:bg-brand-canvas hover:text-brand-navy"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-navy">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{t('nav.sponsors')}</p>
                      <p className="text-xs font-normal text-slate-600">Brand Partnerships & ROI</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/contracts"
              className={`px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                location.pathname === '/contracts'
                  ? 'text-brand-navy underline decoration-2 underline-offset-[1.35rem]'
                  : 'text-slate-700 hover:text-brand-navy'
              }`}
            >
              {t('nav.contracts')}
            </Link>

            <Link
              to="/panduan-role"
              className={`px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                location.pathname === '/panduan-role'
                  ? 'text-brand-navy underline decoration-2 underline-offset-[1.35rem]'
                  : 'text-slate-700 hover:text-brand-navy'
              }`}
            >
              {t('nav.guide')}
            </Link>
          </nav>

          {/* 3. Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Language Selector Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex min-h-10 items-center gap-1.5 px-2 text-sm font-semibold text-slate-700 transition hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <Globe className="w-3.5 h-3.5 text-[#172D46]" />
              <span className="text-[11px] font-black uppercase text-slate-900">{language.toUpperCase()}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* When User has NO role: Solid button */}
                {!user?.activeRole && (
                  <Link
                    to="/onboarding-role"
                    className="inline-flex min-h-10 items-center gap-1.5 bg-brand-navy px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark whitespace-nowrap"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{t('nav.completeRole')}</span>
                  </Link>
                )}

                {/* When User has Role: Show Role Badge */}
                {user?.activeRole && roleInfo && RoleIcon && (
                  <div
                    className={`hidden xl:flex min-h-9 items-center gap-1.5 border px-3 text-sm font-medium whitespace-nowrap ${roleInfo.color}`}
                    title="Peran Tetap Akun Anda"
                  >
                    <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{roleInfo.label}</span>
                  </div>
                )}

                {/* Primary CTA + Buat Event (EO only) */}
                {user?.activeRole === 'EO' && (
                  <button
                    onClick={onOpenCreateEvent}
                    className="inline-flex min-h-10 items-center gap-1.5 bg-brand-forest px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-forest-dark whitespace-nowrap cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('nav.createEvent')}</span>
                  </button>
                )}

                {/* Dashboard Button */}
                {user?.activeRole && (
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                      user.activeRole === 'EO'
                        ? 'hidden sm:flex border border-slate-300 text-slate-700 hover:border-brand-navy hover:text-brand-navy'
                        : 'bg-brand-navy text-white hover:bg-brand-navy-dark'
                    }`}
                    title="Buka Ruang Kerja & Kelola Dagangan"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                )}

                {/* Profile Shortcut */}
                <Link
                  to="/profile"
                    className="inline-flex min-h-10 items-center gap-1.5 border border-slate-300 px-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-navy hover:text-brand-navy whitespace-nowrap"
                  title="Profil Akun & e-KYC"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline truncate max-w-[80px]">
                    {user?.fullName?.split(' ')[0] || 'Profil'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Akun Aktif" />
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="inline-flex h-10 w-10 items-center justify-center text-slate-500 transition hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                  title="Keluar Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="inline-flex min-h-10 items-center gap-1.5 border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-brand-navy hover:text-brand-navy"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex min-h-10 items-center gap-1.5 bg-brand-lime px-3.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-lime-hover"
                >
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-brand-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Responsive Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1 animate-fadeIn">
            {/* Mobile Language Toggle */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-500">Bahasa / Language</span>
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex min-h-10 items-center gap-1.5 px-2 text-sm font-semibold text-slate-700"
              >
                <Globe className="w-3.5 h-3.5 text-[#172D46]" />
                <span className="font-extrabold uppercase">{language === 'id' ? 'ID (Bahasa Indonesia)' : 'EN (English)'}</span>
              </button>
            </div>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block min-h-11 px-4 py-2 text-sm font-semibold transition ${
                location.pathname === '/' ? 'bg-brand-canvas text-brand-navy' : 'text-slate-700 hover:bg-brand-canvas'
              }`}
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`block min-h-11 px-4 py-2 text-sm font-semibold transition ${
                location.pathname.startsWith('/events') ? 'bg-brand-canvas text-brand-navy' : 'text-slate-700 hover:bg-brand-canvas'
              }`}
            >
              {t('nav.events')}
            </Link>

            {/* Mobile Mitra Links */}
            <div className="my-2 space-y-1 py-2">
              <span className="block px-4 pt-1 text-sm font-semibold text-slate-500">
                {t('nav.partners')}
              </span>
              <Link
                to="/vendors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 text-xs font-bold text-slate-700 hover:text-[#172D46]"
              >
                {t('nav.vendors')}
              </Link>
              <Link
                to="/bands"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 text-xs font-bold text-slate-700 hover:text-[#172D46]"
              >
                {t('nav.bands')}
              </Link>
              <Link
                to="/organizers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 text-xs font-bold text-slate-700 hover:text-[#172D46]"
              >
                {t('nav.organizers')}
              </Link>
              <Link
                to="/sponsors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 text-xs font-bold text-slate-700 hover:text-[#172D46]"
              >
                {t('nav.sponsors')}
              </Link>
            </div>

            <Link
              to="/contracts"
              onClick={() => setMobileMenuOpen(false)}
                className={`block min-h-11 px-4 py-2 text-sm font-semibold transition ${
                location.pathname === '/contracts' ? 'bg-brand-canvas text-brand-navy' : 'text-slate-700 hover:bg-brand-canvas'
              }`}
            >
              {t('nav.contracts')}
            </Link>

            <Link
              to="/panduan-role"
              onClick={() => setMobileMenuOpen(false)}
                className={`block min-h-11 px-4 py-2 text-sm font-semibold transition ${
                location.pathname === '/panduan-role' ? 'bg-brand-canvas text-brand-navy' : 'text-slate-700 hover:bg-brand-canvas'
              }`}
            >
              {t('nav.guide')}
            </Link>

            {!isAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 px-4 pt-3 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-4 text-sm font-semibold text-slate-700"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center bg-brand-lime px-4 text-sm font-semibold text-brand-ink"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 space-y-2 px-1">
                {!user?.activeRole && (
                  <Link
                    to="/onboarding-role"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 w-full items-center justify-center gap-1.5 bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Lengkapi Peran Akun</span>
                  </Link>
                )}

                {user?.activeRole && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-11 w-full items-center justify-center gap-1.5 bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Buka Dashboard</span>
                  </Link>
                )}

                {user?.activeRole === 'EO' && (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenCreateEvent();
                      }}
                      className="flex min-h-11 w-full items-center justify-center gap-1.5 bg-brand-forest px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Buat Event Baru</span>
                    </button>

                    {onOpenUploadPortfolio && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenUploadPortfolio();
                        }}
                      className="flex min-h-11 w-full items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-brand-navy"
                      >
                        <span>+ Unggah Portofolio Acara</span>
                      </button>
                    )}
                  </>
                )}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-brand-canvas"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profil Akun ({user?.fullName || 'Pengguna'})</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
