import { Link } from 'react-router-dom';
import { ArrowRight, Award, CalendarDays, Film, MapPin, Star } from 'lucide-react';
import { EventItem } from '../../data/mockEvents';
import { useLanguage } from '../../context/LanguageContext';
import { categoryLabels } from './EventCardLive';

interface Props {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
}

const categoryKeys = {
  CONCERT: 'events.concert',
  PENSI: 'events.pensi',
  BAZAAR: 'events.bazaar',
  EXPO: 'events.expo',
} as const;

export default function EventCardPortfolio({ event, onViewDetails }: Props) {
  const { t } = useLanguage();
  const category = categoryLabels[event.category];

  return (
    <article data-gsap-reveal className="group flex h-full flex-col">
      <Link
        to={'/events/' + event.id}
        aria-label={t('eventPortfolio.details') + ': ' + event.title}
        className="block aspect-[4/3] overflow-hidden bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
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

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
            <Award aria-hidden="true" className="h-4 w-4" />
            {t('eventPortfolio.badge')}
          </span>
          <span className={category?.color || 'text-brand-navy'}>{t(categoryKeys[event.category])}</span>
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

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-slate-600">{t('eventCard.organizer')}</p>
            <p className="mt-1 truncate font-semibold text-slate-950">{event.organizer.name}</p>
            <p className="mt-1 text-sm text-slate-600">{event.organizer.city}</p>
          </div>
          {event.stats && (
            <span className="inline-flex shrink-0 items-center gap-1.5 pt-1 text-sm font-semibold text-slate-700">
              <Star aria-hidden="true" className="h-4 w-4 text-brand-forest" />
              {event.stats.rating}
            </span>
          )}
        </div>

        {event.stats && (
          <dl className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-slate-600">{t('eventPortfolio.audience')}</dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">{event.stats.attendees}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">{t('eventPortfolio.budget')}</dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">{event.stats.budget}</dd>
            </div>
          </dl>
        )}

        <p className="mt-4 flex-1 text-base leading-7 text-slate-600">{event.description}</p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {event.stats?.aftermovieUrl && (
            <a
              href={event.stats.aftermovieUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('eventPortfolio.watch') + ': ' + event.title}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 px-4 text-sm font-semibold text-brand-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <Film aria-hidden="true" className="h-4 w-4" />
              {t('eventPortfolio.watch')}
            </a>
          )}
          <button
            type="button"
            onClick={() => onViewDetails(event)}
            className="inline-flex min-h-11 flex-1 items-center justify-between gap-3 bg-brand-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            {t('eventPortfolio.details')}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
