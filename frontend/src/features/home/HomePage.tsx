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
import Band from './components/Band';
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

      <HomeHero
        featuredEvent={visibleEvents.find((event) => !event.isPortfolio)}
        onOpenCreateEvent={onOpenCreateEvent}
      />
      {user && (
        <Band tone="bg-brand-cream" className="!py-8 sm:!py-10">
      {user && !user.activeRole && (
        <div className="flex flex-col gap-4 rounded-lg bg-brand-lime p-6 text-brand-navy sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-brand-navy">{t('nav.completeRole')}</p>
            <p className="mt-1 text-sm leading-6 text-brand-navy">{t('home.rolePrompt')}</p>
          </div>
          <Link
            to="/onboarding-role"
            className="inline-flex min-h-11 items-center justify-center gap-2 min-h-12 rounded-full bg-brand-navy px-6 text-base font-semibold text-brand-lime transition-colors hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
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

        </Band>
      )}

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
