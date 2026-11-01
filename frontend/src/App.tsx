import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { initialEvents, EventItem } from './data/mockEvents';
import { PartnerItem } from './data/mockPartners';
import { initialContracts, CollaborationContract } from './components/ContractListTab';

// Auth Context & Protected Route
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import ContractModal from './components/ContractModal';

// Pages
import { HomePage } from './features/home';
import { EventDetailPage, SearchEventsPage } from './features/events';
import SearchOrganizersPage from './pages/SearchOrganizersPage';
import SearchBandsPage from './pages/SearchBandsPage';
import SearchVendorsPage from './pages/SearchVendorsPage';
import PartnerDetailPage from './pages/PartnerDetailPage';
import SponsorHubPage from './pages/SponsorHubPage';
import ContractsPage from './pages/ContractsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RolesGuidePage from './pages/RolesGuidePage';
import DashboardPage from './pages/DashboardPage';
import RoleOnboardingPage from './pages/RoleOnboardingPage';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding-role';

  const {
    user,
    requireAuth,
    authPromptModalOpen,
    authPromptMessage,
    closeAuthPrompt,
  } = useAuth();

  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [contracts, setContracts] = useState<CollaborationContract[]>(initialContracts);
  const currentRole: UserRole = user?.activeRole || 'EO';

  // Helper: Map Supabase database event to frontend EventItem
  const mapBackendEvent = (ev: any): EventItem => ({
    id: ev.id,
    title: ev.title,
    category: ev.event_category || 'CONCERT',
    organizer: {
      name: ev.organizer?.full_name || 'Nusantara Live Kreasi',
      avatar: '/assets/crew-production.jpg',
      verified: ev.organizer?.kyc_status === 'VERIFIED',
      city: 'Jakarta Selatan',
    },
    venue: ev.venue_name || 'Plaza Barat Senayan, GBK',
    date: ev.start_date
      ? new Date(ev.start_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'TBA',
    description: ev.description || '',
    bannerImage: ev.banner_image || '/assets/hero-concert.jpg',
    isPortfolio: Boolean(ev.is_portfolio),
    progress: ev.is_portfolio
      ? undefined
      : {
          stage: 'Tahap 2: Pengadaan Vendor & Tenant',
          vendorFilled: Math.min(100, Math.max(35, (ev.vendor_bookings?.length || 1) * 25)),
          boothFilled: ev.tenant_booths?.length || 16,
          crewNeeded: ev.crew_shifts?.length || 12,
        },
    stats: ev.is_portfolio
      ? {
          attendees: `${(ev.attendee_count || 15000).toLocaleString('id-ID')} Pengunjung`,
          budget: `Rp ${(ev.total_budget || 450000000).toLocaleString('id-ID')}`,
          rating: 4.95,
          aftermovieUrl: ev.aftermovie_url,
        }
      : undefined,
  });

  const fetchLiveEvents = () => {
    fetch('/api/v1/events')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const mapped = resData.data.map(mapBackendEvent);
          setEvents(mapped);
        }
      })
      .catch(() => {});
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

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [activeContract, setActiveContract] = useState<any>(null);

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

  const handleProposalSubmitted = (proposalData: any) => {
    const contractNo = `PKS/EY/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
    const newContract: CollaborationContract = {
      id: proposalData?.id || 'cnt-' + Date.now(),
      contractNumber: contractNo,
      partyOne: 'Nusantara Live Kreasi (EO)',
      partyTwo: proposalTargetPartner
        ? proposalTargetPartner.name
        : proposalTargetEvent
        ? `${proposalData.proposal_type} Mitra Terpilih`
        : 'Mitra Produksi',
      roleType: proposalData.proposal_type || 'VENDOR',
      eventTitle: proposalTargetEvent ? proposalTargetEvent.title : 'Soundfest Archipelago 2027',
      totalAmount: proposalData.deal_price || proposalData.offered_price || 0,
      dpPercentage: proposalData.dp_percentage || 50,
      scopeOfWork: proposalData.scope_of_work || 'Pengadaan teknis & penampilan panggung acara.',
      date: new Date().toLocaleDateString('id-ID'),
      status: 'CONTRACT_SIGNED',
      attachedFileName: proposalData.attached_file_name || null,
      attachedFileSize: proposalData.attached_file_size || null,
      contractDocumentUrl: proposalData.contract_document_url || null,
    };

    setContracts([newContract, ...contracts]);
    setActiveContract({
      id: newContract.id,
      contractNumber: newContract.contractNumber,
      partyOne: newContract.partyOne,
      partyTwo: newContract.partyTwo,
      roleType: newContract.roleType,
      eventTitle: newContract.eventTitle,
      totalAmount: newContract.totalAmount,
      dpPercentage: newContract.dpPercentage,
      scopeOfWork: newContract.scopeOfWork,
      date: newContract.date,
      attachedFileName: newContract.attachedFileName,
      attachedFileSize: newContract.attachedFileSize,
      contractDocumentUrl: newContract.contractDocumentUrl,
    });

    setIsContractModalOpen(true);
    showToast('Penawaran diterima. Draf Surat Perjanjian Kerjasama (PKS) digital siap ditandatangani.');
  };

  const handleSignContractAndFund = async () => {
    if (activeContract?.id) {
      try {
        await fetch(`/api/v1/proposals/${activeContract.id}/fund-escrow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payer_id: user?.id }),
        });
      } catch {}
    }

    if (activeContract) {
      setContracts((prev) =>
        prev.map((c) =>
          c.contractNumber === activeContract.contractNumber ? { ...c, status: 'ESCROW_FUNDED' } : c
        )
      );
    }
    setIsContractModalOpen(false);
    showToast('PKS Digital disetujui. Dana DP berhasil diamankan di Rekening Bersama Escrow Midtrans.');
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
      <main className={isAuthPage ? 'flex-1 w-full' : 'flex-1 w-full px-5 sm:px-8 lg:px-12 2xl:px-16 py-6 sm:py-8'}>
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
                    fetch('/api/v1/proposals', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        event_id: event.id,
                        sender_id: user?.id,
                        receiver_id: 'a0000000-0000-0000-0000-000000000001',
                        proposal_type: 'SPONSOR',
                        direction: 'PARTNER_TO_EO',
                        title: `Proposal Sponsorship ${tier} - ${event.title}`,
                        offered_price: Number(budget) || 150000000,
                        dp_percentage: 50,
                        scope_of_work: `Kemitraan Sponsorship Paket ${tier} untuk ${event.title}.`,
                      }),
                    }).catch(() => {});
                    showToast(`Proposal sponsorship paket ${tier} diajukan ke ${event.title} senilai Rp ${Number(budget).toLocaleString('id-ID')}`);
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
            path="/contracts"
            element={
              <ProtectedRoute requiresRole={true}>
                <ContractsPage onShowToast={showToast} />
              </ProtectedRoute>
            }
          />
        </Routes>
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
        onSuccess={(newEvent) => {
          fetchLiveEvents();
          setEvents((prev) => [newEvent, ...prev]);
          setIsCreateEventModalOpen(false);
          showToast(`Proyek acara baru "${newEvent.title}" berhasil dipublikasikan.`);
        }}
      />

      <UploadPortfolioModal
        isOpen={isUploadPortfolioModalOpen}
        onClose={() => setIsUploadPortfolioModalOpen(false)}
        onSuccess={(newPortfolio) => {
          fetchLiveEvents();
          setEvents((prev) => [newPortfolio, ...prev]);
          setIsUploadPortfolioModalOpen(false);
          showToast(`Katalog rekam jejak "${newPortfolio.title}" berhasil ditambahkan ke portofolio.`);
        }}
      />

      <ProposalModal
        isOpen={isProposalModalOpen}
        event={proposalTargetEvent}
        partner={proposalTargetPartner}
        mode={proposalMode}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={handleProposalSubmitted}
      />

      {activeContract && (
        <ContractModal
          isOpen={isContractModalOpen}
          contractData={activeContract}
          onClose={() => setIsContractModalOpen(false)}
          onSignAndFund={handleSignContractAndFund}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
