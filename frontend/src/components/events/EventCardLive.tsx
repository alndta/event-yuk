import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  Music2,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { EventItem } from '../../data/mockEvents';
import { useLanguage } from '../../context/LanguageContext';
import Avatar from '../Avatar';

interface Props {
  event: EventItem;
  onSelectAction: (action: string, event: EventItem) => void;
}

export const categoryLabels: Record<string, { label: string; color: string }> = {
  CONCERT: { label: 'Konser Musik', color: 'text-brand-navy' },
  PENSI: { label: 'Pensi Sekolah', color: 'text-brand-navy' },
  BAZAAR: { label: 'Bazaar & Kuliner', color: 'text-brand-navy' },
  EXPO: { label: 'Pameran & Expo', color: 'text-brand-navy' },
};

const categoryKeyById = {
  CONCERT: 'events.concert',
  PENSI: 'events.pensi',
  BAZAAR: 'events.bazaar',
  EXPO: 'events.expo',
} as const;

export default function EventCardLive({ event, onSelectAction }: Props) {
  const { t } = useLanguage();
  const category = categoryLabels[event.category];
  const categoryLabel = t(categoryKeyById[event.category]);
  const completion = Math.min(100, Math.max(0, event.progress?.vendorFilled || 0));
  const quickActions = [
    { id: 'booth', label: t('eventCard.boothAction'), icon: ShoppingBag },
    { id: 'crew', label: t('eventCard.crewAction'), icon: Users },
    { id: 'vendor-quote', label: t('eventCard.vendorAction'), icon: SlidersHorizontal },
    { id: 'band-quote', label: t('eventCard.talentAction'), icon: Music2 },
  ];

  return (
    <article data-gsap-reveal className="ey-lift group flex h-full flex-col overflow-hidden rounded-2xl bg-white">
      <Link
        to={'/events/' + event.id}
        aria-label={t('eventCard.details') + ': ' + event.title}
        className="block aspect-[16/10] overflow-hidden bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
      >
        <img
          src={event.bannerImage}
          alt={event.title}
          width={1200}
          height={750}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <span className="font-semibold text-brand-navy">{t('eventCard.openStatus')}</span>
          <span className={category?.color || 'text-brand-navy'}>{categoryLabel}</span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-slate-950">
          <Link
            to={'/events/' + event.id}
            className="rounded-sm outline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-navy"
          >
            {event.title}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6 text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-navy" />
            {event.date}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-navy" />
            <span className="line-clamp-1">{event.venue}</span>
          </span>
        </div>

        <div className="mt-4 flex min-w-0 items-center gap-3">
          <Avatar
            src={event.organizer.avatar}
            name={event.organizer.name}
            decorative
            className="h-9 w-9 rounded-full"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
              <span className="truncate">{event.organizer.name}</span>
              {event.organizer.verified && (
                <BadgeCheck
                  aria-label={t('eventCard.verifiedOrganizer')}
                  className="h-4 w-4 shrink-0 text-brand-navy"
                />
              )}
            </p>
            <p className="truncate text-sm text-slate-600">{event.organizer.city}</p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 min-h-14 text-base leading-7 text-slate-600">
          {event.description}
        </p>

        {event.progress && (
          <div className="mt-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-6 text-slate-800">{event.progress.stage}</p>
              <span className="shrink-0 text-sm font-semibold text-brand-navy">
                {completion}% {t('eventCard.filled')}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('eventCard.progressLabel') + ': ' + completion + '%'}
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-sand"
            >
              <div data-gsap-bar className="h-full rounded-full bg-brand-navy" style={{ width: completion + '%' }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span>{t('eventCard.boothCount')}: <strong className="font-semibold text-slate-950">{event.progress.boothFilled}</strong></span>
              <span>{t('eventCard.crewCount')}: <strong className="font-semibold text-slate-950">{event.progress.crewNeeded}</strong></span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Link
            to={'/events/' + event.id}
            className="inline-flex min-h-11 w-full items-center justify-between gap-3 bg-brand-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            {t('eventCard.details')}
            <span aria-hidden="true">→</span>
          </Link>
          <div aria-label={t('eventCard.quickActions')} className="mt-3 grid grid-cols-2 gap-x-3">
            {quickActions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelectAction(id, event)}
                className="inline-flex min-h-10 items-center gap-2 border-b border-slate-200 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-navy" />
                <span className="line-clamp-1">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
