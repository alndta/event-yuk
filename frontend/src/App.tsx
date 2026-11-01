import { api, ApiError } from './lib/api';
import { mapBackendEvent } from './utils/mapEvent';
import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { EventItem } from './types/models';
import { PartnerItem } from './types/models';

// Auth Context & Protected Route
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LoadingState from './components/Spinner';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import useSmoothScroll from './hooks/useSmoothScroll';
import { gsap, ScrollTrigger, NO_REDUCED_MOTION } from './lib/motion';
import AuthPromptModal from './components/AuthPromptModal';
import ScrollToTop from './components/ScrollToTop';

// Navigation & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Modals
import { UserRole } from './components/RoleOnboardingModal';
import CreateEventModal from './components/CreateEventModal';
import UploadPortfolioModal from './components/UploadPortfolioModal';
import ProposalModal from './components/ProposalModal';

// Pages: the home page ships with the app, everything else loads when its route opens.
import { HomePage } from './features/home';
const SearchEventsPage = lazy(() => import('./features/events/SearchEventsPage'));
const EventDetailPage = lazy(() => import('./features/events/EventDetailPage'));
const SearchOrganizersPage = lazy(() => import('./pages/SearchOrganizersPage'));
const SearchBandsPage = lazy(() => import('./pages/SearchBandsPage'));
const SearchVendorsPage = lazy(() => import('./pages/SearchVendorsPage'));
const PartnerDetailPage = lazy(() => import('./pages/PartnerDetailPage'));
const SponsorHubPage = lazy(() => import('./pages/SponsorHubPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
const AdminKycPage = lazy(() => import('./pages/AdminKycPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RolesGuidePage = lazy(() => import('./pages/RolesGuidePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RoleOnboardingPage = lazy(() => import('./pages/RoleOnboardingPage'));

function AppContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRoute = useRef(true);

  // Each new page settles into place instead of snapping in.
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const el = mainRef.current;
    if (!el || !window.matchMedia(NO_REDUCED_MOTION).matches) return;
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 36 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.95,
        ease: 'ey',
        clearProps: 'transform,opacity,visibility',
        onComplete: () => ScrollTrigger.refresh(),
      }
    );
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'transform,opacity,visibility' });
    };
  }, [location.pathname]);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding-role';

  const {
    user,
    requireAuth,
    authPromptModalOpen,
    authPromptMessage,
    closeAuthPrompt,
  } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const currentRole: UserRole = user?.activeRole || 'EO';

  // Helper: Map Supabase database event to frontend EventItem
  // Real data from the backend. The bundled sample events appear only in local development
  // when the server is not running, so a production visitor never sees invented events.
  const fetchLiveEvents = () => {
    api('/events', { anonymous: true })
      .then((res) => setEvents((res.data || []).map(mapBackendEvent)))
      .catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchLiveEvents();
  }, []);

  // Modals state
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isUploadPortfolioModalOpen, setIsUploadPortfolioModalOpen] = useState(false);

  // Proposal & Contract flow state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalTargetEvent, setProposalTargetEvent] = useState<EventItem | null>(null);
  const [proposalTargetPartner, setProposalTargetPartner] = useState<PartnerItem | null>(null);
  const [proposalMode, setProposalMode] = useState<'PARTNER_TO_EO' | 'EO_TO_PARTNER'>('PARTNER_TO_EO');


  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Protected action triggers
  const handleOpenCreateEventGuarded = () => {
    requireAuth(() => {
      setIsCreateEventModalOpen(true);
    }, 'Yuk, masuk ke akun Event Organizer kamu untuk mempublikasikan proyek acara baru.');
  };

  const handleOpenUploadPortfolioGuarded = () => {
    requireAuth(() => {
      setIsUploadPortfolioModalOpen(true);
    }, 'Yuk, masuk ke akun Event Organizer kamu untuk menambahkan rekam jejak portofolio.');
  };

  const handleEventAction = (action: string, ev: EventItem) => {
    if (action === 'vendor-quote' || action === 'band-quote') {
      requireAuth(() => {
        setProposalTargetEvent(ev);
        setProposalTargetPartner(null);
        setProposalMode('PARTNER_TO_EO');
        setIsProposalModalOpen(true);
      }, `Tertarik mengajukan penawaran terbaikmu untuk ${ev.title}? Masuk dulu agar proposalmu langsung sampai ke pihak EO.`);
    } else if (action === 'booth') {
      requireAuth(() => {
        navigate(`/events/${ev.id}`);
        showToast(`Pendaftaran Kaveling Booth dibuka untuk: ${ev.title}`);
      }, `Tertarik buka booth di ${ev.title}? Yuk masuk ke akun Tenant kamu untuk memilih denah kaveling!`);
    } else if (action === 'crew') {
      requireAuth(() => {
        navigate(`/events/${ev.id}`);
        showToast(`Papan lowongan shift kru dibuka untuk: ${ev.title}`);
      }, `Siap terjun ke lapangan di ${ev.title}? Masuk ke akun Kru kamu untuk memilih shift dan mengunci jadwal kerja!`);
    }
  };

  const handleInvitePartner = (partner: PartnerItem) => {
    requireAuth(() => {
      setProposalTargetEvent(null);
      setProposalTargetPartner(partner);
      setProposalMode('EO_TO_PARTNER');
      setIsProposalModalOpen(true);
    }, `Ingin mengajak ${partner.name} berkolaborasi? Yuk masuk sebagai Event Organizer untuk mengirim undangan resmi.`);
  };

  const handleViewEventDetails = (ev: EventItem) => {
    navigate(`/events/${ev.id}`);
  };

  const handleProposalSubmitted = () => {
    showToast('Penawaran terkirim. Pantau jawabannya di halaman Kontrak.');
    navigate('/contracts');
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar (Hidden on Login & Register full pages) */}
      {!isAuthPage && (
        <Navbar
          currentRole={currentRole}
          onOpenCreateEvent={handleOpenCreateEventGuarded}
          onOpenUploadPortfolio={handleOpenUploadPortfolioGuarded}
        />
      )}

      {/* Main Routed Content */}
      <main ref={mainRef} className={isAuthPage ? 'flex-1 w-full' : 'flex-1 w-full px-5 sm:px-8 lg:px-12 2xl:px-16 py-6 sm:py-8'}>
        <Suspense
          fallback={
            <LoadingState label={t('common.loadingPage')} />
          }
        >
        <Routes>
          {/* Public Routes (Accessible without login) */}
          <Route
            path="/"
            element={
              <HomePage
                events={events}
                currentRole={currentRole}
                onOpenCreateEvent={handleOpenCreateEventGuarded}
                onOpenUploadPortfolio={handleOpenUploadPortfolioGuarded}
                onSelectAction={handleEventAction}
                onViewDetails={handleViewEventDetails}
              />
            }
          />
          <Route
            path="/events"
            element={
              <SearchEventsPage
                events={events}
                onSelectAction={handleEventAction}
                onViewDetails={handleViewEventDetails}
              />
            }
          />
          <Route
            path="/events/:id"
            element={
              <EventDetailPage
                events={events}
                onOpenProposal={(ev, _roleType) => {
                  requireAuth(() => {
                    setProposalTargetEvent(ev);
                    setProposalTargetPartner(null);
                    setProposalMode('PARTNER_TO_EO');
                    setIsProposalModalOpen(true);
                  }, `Silakan masuk untuk mengajukan penawaran ke acara ${ev.title}.`);
                }}
              />
            }
          />
          <Route
            path="/organizers"
            element={
              <SearchOrganizersPage
                onInviteOrganizer={(eo) => {
                  requireAuth(() => {
                    showToast(`Mengirim ajakan kolaborasi ke promotor: ${eo.name}`);
                  }, `Silakan masuk untuk mengajak kolaborasi promotor ${eo.name}.`);
                }}
              />
            }
          />
          <Route
            path="/bands"
            element={
              <SearchBandsPage
                onProposeTalent={(band) => {
                  handleInvitePartner(band);
                }}
              />
            }
          />
          <Route
            path="/vendors"
            element={
              <SearchVendorsPage
                onProposeVendor={(vendor) => {
                  handleInvitePartner(vendor);
                }}
              />
            }
          />
          <Route
            path="/sponsors"
            element={
              <SponsorHubPage
                events={events}
                onApplySponsorship={(event, tier, budget) => {
                  requireAuth(() => {
                    api('/proposals', {
                      method: 'POST',
                      body: {
                        event_id: event.id,
                        receiver_id: event.organizerId,
                        proposal_type: 'SPONSOR',
                        direction: 'PARTNER_TO_EO',
                        title: `Proposal sponsorship ${tier} - ${event.title}`,
                        offered_price: Number(budget),
                        dp_percentage: 50,
                        scope_of_work: `Kemitraan sponsorship paket ${tier} untuk ${event.title}.`,
                      },
                    })
                      .then(() => showToast(`Proposal sponsorship paket ${tier} terkirim ke ${event.title}.`))
                      .catch((err) => showToast(err instanceof ApiError ? err.message : 'Proposal belum terkirim.'));
                  }, `Tertarik menjadi mitra brand di ${event.title}? Yuk masuk dulu untuk mengajukan paket sponsorship resmi.`);
                }}
              />
            }
          />

          {/* Partner Detail Pages (Vendors, Bands, Organizers) */}
          <Route
            path="/partners/:id"
            element={<PartnerDetailPage onProposePartner={handleInvitePartner} />}
          />
          <Route
            path="/vendors/:id"
            element={<PartnerDetailPage onProposePartner={handleInvitePartner} />}
          />
          <Route
            path="/bands/:id"
            element={<PartnerDetailPage onProposePartner={handleInvitePartner} />}
          />
          <Route
            path="/organizers/:id"
            element={<PartnerDetailPage onProposePartner={handleInvitePartner} />}
          />

          {/* Panduan Peran & Ekosistem (Public Access) */}
          <Route path="/panduan-role" element={<RolesGuidePage />} />
          <Route path="/roles-guide" element={<RolesGuidePage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role Onboarding (For Authenticated Users without a role) */}
          <Route
            path="/onboarding-role"
            element={
              <ProtectedRoute requiresRole={false}>
                <RoleOnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes (Require Login & Permanent Role) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiresRole={true}>
                <DashboardPage onShowToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiresRole={true}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <ProtectedRoute requiresRole={false}>
                <AdminKycPage onShowToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contracts"
            element={
              <ProtectedRoute requiresRole={true}>
                <ContractsPage onShowToast={showToast} />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </main>

      {/* Footer (Hidden on Login & Register full pages) */}
      {!isAuthPage && <Footer />}

      {/* Auth Prompt Modal (For Unauthenticated Guests attempting guarded actions) */}
      <AuthPromptModal
        isOpen={authPromptModalOpen}
        message={authPromptMessage}
        onClose={closeAuthPrompt}
      />

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onSuccess={() => {
          fetchLiveEvents();
          setIsCreateEventModalOpen(false);
          showToast("Proyek acara baru berhasil dipublikasikan.");
        }}
      />

      <UploadPortfolioModal
        isOpen={isUploadPortfolioModalOpen}
        onClose={() => setIsUploadPortfolioModalOpen(false)}
        onSuccess={() => {
          fetchLiveEvents();
          setIsUploadPortfolioModalOpen(false);
          showToast("Rekam jejak berhasil ditambahkan ke portofolio.");
        }}
      />

      <ProposalModal
        isOpen={isProposalModalOpen}
        event={proposalTargetEvent}
        partner={proposalTargetPartner}
        mode={proposalMode}
        myEvents={events.filter((ev) => !ev.isPortfolio && ev.organizerId === user?.id)}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={handleProposalSubmitted}
      />

    </div>
  );
}

export default function App() {
  useSmoothScroll();
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
