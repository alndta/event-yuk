import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventItem, initialEvents } from '../../data/mockEvents';
import { mockPartners, PartnerItem } from '../../data/mockPartners';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SEOHead } from '../../components/SEOHead';
import RoleContextBar from '../../components/RoleContextBar';
import { UserRole } from '../../components/RoleOnboardingModal';
import { cachedFetch } from '../../utils/apiCache';
import HomeHero from './components/HomeHero';
import HomeRoleSection from './components/HomeRoleSection';
import HowItWorksSection from './components/HowItWorksSection';
import HomeDiscoverySections from './components/HomeDiscoverySections';
import HomeCallToAction from './components/HomeCallToAction';
import HomeFaqSection from './components/HomeFaqSection';
import HomeMarquee from './components/HomeMarquee';
import useGsapReveal from '../../hooks/useGsapReveal';

interface Props {
  events?: EventItem[];
  currentRole: UserRole;
  onSwitchRoleClick?: () => void;
  onOpenCreateEvent: () => void;
  onOpenUploadPortfolio: () => void;
  onSelectAction: (action: string, event: EventItem) => void;
  onViewDetails: (event: EventItem) => void;
}

export default function HomePage({
  events,
  currentRole,
  onOpenCreateEvent,
  onOpenUploadPortfolio,
  onSelectAction,
  onViewDetails,
}: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [partners, setPartners] = useState<PartnerItem[]>(mockPartners);
  const pageRef = useRef<HTMLDivElement>(null);

  useGsapReveal(pageRef);

  useEffect(() => {
    cachedFetch('/api/v1/users/partners')
      .then((response: any) => {
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          setPartners(response.data);
        }
      })
      .catch(() => {});
  }, []);

  const visibleEvents = events && events.length > 0 ? events : initialEvents;

  return (
    <>
      <SEOHead
        title="Event Yuk — Kolaborasi acara dari proyek sampai hari-H"
        description={t('hero.desc')}
        keywords="event organizer indonesia, vendor acara, band festival, tenant bazaar, kontrak PKS digital"
        canonicalPath="/"
        schemaJson={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Event Yuk',
          },
        ]}
      />

      <div ref={pageRef} className="-mb-[6.5rem] sm:-mb-28">

      {user && !user.activeRole && (
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="font-semibold text-amber-950">{t('nav.completeRole')}</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">{t('home.rolePrompt')}</p>
          </div>
          <Link
            to="/onboarding-role"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
          >
            {t('home.chooseRole')}
          </Link>
        </div>
      )}

      {user?.activeRole && (
        <RoleContextBar
          currentRole={user.activeRole || currentRole}
          onOpenCreateEvent={onOpenCreateEvent}
          onOpenUploadPortfolio={onOpenUploadPortfolio}
        />
      )}

      <HomeHero
        featuredEvent={visibleEvents.find((event) => !event.isPortfolio)}
        onOpenCreateEvent={onOpenCreateEvent}
      />
      <HomeDiscoverySections
        events={visibleEvents}
        partners={partners}
        onSelectAction={onSelectAction}
        onViewDetails={onViewDetails}
      />
      <HomeRoleSection onOpenCreateEvent={onOpenCreateEvent} />
      <HomeMarquee />
      <HowItWorksSection />
      <HomeFaqSection />
      <HomeCallToAction onOpenCreateEvent={onOpenCreateEvent} />
      </div>
    </>
  );
}
