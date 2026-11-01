import { useState } from 'react';
import { ArrowRight, CalendarDays, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EventItem } from '../../../data/mockEvents';
import { PartnerItem } from '../../../data/mockPartners';
import { useLanguage } from '../../../context/LanguageContext';
import EventCardLive from '../../../components/events/EventCardLive';
import EventCardPortfolio from '../../../components/events/EventCardPortfolio';
import SectionHeading from './SectionHeading';

interface Props {
  events: EventItem[];
  partners: PartnerItem[];
  onSelectAction: (action: string, event: EventItem) => void;
  onViewDetails: (event: EventItem) => void;
}

export default function HomeDiscoverySections({
  events,
  partners,
  onSelectAction,
  onViewDetails,
}: Props) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const liveEvents = events.filter((event) => !event.isPortfolio);
  const portfolioEvents = events.filter((event) => event.isPortfolio).slice(0, 3);
  const featuredPartners = [
    ...partners.filter((partner) => partner.type === 'VENDOR').slice(0, 2),
    ...partners.filter((partner) => partner.type === 'TALENT').slice(0, 2),
  ];
  const categories = [
    { id: 'ALL', label: t('events.all') },
    { id: 'CONCERT', label: t('events.concert') },
    { id: 'PENSI', label: t('events.pensi') },
    { id: 'EXPO', label: t('events.expo') },
    { id: 'BAZAAR', label: t('events.bazaar') },
  ];
  const filteredEvents = selectedCategory === 'ALL'
    ? liveEvents
    : liveEvents.filter((event) => event.category === selectedCategory);

  return (
    <div className="space-y-24 sm:space-y-32">
      <section aria-labelledby="home-events-title" data-gsap-reveal className="space-y-7">
        <SectionHeading
          id="home-events-title"
          title={t('events.title')}
          description={t('events.desc')}
          action={
            <Link
              to="/events"
              className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              {t('events.exploreAll')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          }
        />

        <div aria-label={t('events.filterLabel')} className="flex flex-wrap gap-x-5 gap-y-2">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedCategory === id}
              onClick={() => setSelectedCategory(id)}
              className={
                'min-h-11 shrink-0 border-b-2 px-1 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ' +
                (selectedCategory === id
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950')
              }
            >
              {label}
            </button>
          ))}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCardLive key={event.id} event={event} onSelectAction={onSelectAction} />
            ))}
          </div>
        ) : (
          <div className="bg-white px-6 py-10 text-center">
            <CalendarDays aria-hidden="true" className="mx-auto h-7 w-7 text-brand-navy" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{t('events.emptyTitle')}</h3>
            <p className="mt-2 text-base leading-7 text-slate-600">{t('events.emptyDesc')}</p>
            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="mt-4 min-h-10 px-1 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                {t('events.all')}
              </button>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="home-partners-title" data-gsap-reveal className="space-y-8">
        <SectionHeading
          id="home-partners-title"
          title={t('partners.title')}
          description={t('partners.desc')}
          action={
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link to="/vendors" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline">
                {t('partners.vendorLink')} <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link to="/bands" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline">
                {t('partners.bandLink')} <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          }
        />

        {featuredPartners.length > 0 ? (
          <ul className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
            {featuredPartners.map((partner) => (
              <li key={partner.id} data-gsap-reveal className="flex min-w-0 gap-4 sm:gap-5">
                <img
                  src={partner.avatar}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-navy">
                    {partner.type === 'TALENT' ? t('partners.talentType') : t('partners.vendorType')}
                  </p>
                  <h3 className="mt-1 truncate text-lg font-semibold text-slate-950">{partner.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{partner.city}</p>
                  <p className="mt-3 text-base leading-7 text-slate-600">{partner.description}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {t('partners.priceLabel')} <strong className="font-semibold text-slate-950">{partner.priceRange}</strong>
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Star aria-hidden="true" className="h-4 w-4 text-brand-forest" />
                      {partner.rating}
                    </span>
                    <Link
                      to={partner.type === 'TALENT' ? '/bands/' + partner.id : '/vendors/' + partner.id}
                      className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                    >
                      {t('partners.detailLink')}
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="bg-white px-6 py-8 text-base leading-7 text-slate-600">{t('partners.empty')}</p>
        )}
      </section>

      <section aria-labelledby="home-portfolio-title" data-gsap-reveal className="space-y-7">
        <SectionHeading
          id="home-portfolio-title"
          title={t('portfolio.title')}
          description={t('portfolio.desc')}
          action={
            <Link
              to="/events"
              className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              {t('portfolio.link')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          }
        />
        {portfolioEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {portfolioEvents.map((event) => (
              <EventCardPortfolio key={event.id} event={event} onViewDetails={onViewDetails} />
            ))}
          </div>
        ) : (
          <p className="bg-white px-6 py-8 text-base leading-7 text-slate-600">{t('portfolio.empty')}</p>
        )}
      </section>
    </div>
  );
}
