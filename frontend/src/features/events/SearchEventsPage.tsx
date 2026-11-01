import { useEffect, useRef, useState } from 'react';
import { Award, CalendarDays, Filter, RotateCcw, Search, Zap } from 'lucide-react';
import { EventItem } from '../../types/models';
import EventCardLive from '../../components/events/EventCardLive';
import EventCardPortfolio from '../../components/events/EventCardPortfolio';
import { EventCardsSkeletonList } from '../../components/skeletons/EventCardSkeleton';
import { SEOHead } from '../../components/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { api, query } from '../../lib/api';
import useDebounced from '../../hooks/useDebounced';
import { mapBackendEvent } from '../../utils/mapEvent';
import EmptyState from '../../components/EmptyState';
import useGsapReveal from '../../hooks/useGsapReveal';

interface Props {
  events?: EventItem[];
  onSelectAction: (action: string, event: EventItem) => void;
  onViewDetails: (event: EventItem) => void;
}

type StatusFilter = 'ALL' | 'LIVE' | 'PORTFOLIO';

const categoryIds = ['ALL', 'CONCERT', 'PENSI', 'BAZAAR', 'EXPO'] as const;

export default function SearchEventsPage({
  events: propEvents,
  onSelectAction,
  onViewDetails,
}: Props) {
  const { t } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);
  const [eventsList, setEventsList] = useState<EventItem[]>(propEvents || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof categoryIds)[number]>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');

  useGsapReveal(pageRef);

  const debouncedSearch = useDebounced(searchTerm.trim(), 300);

  // Searching and filtering happen on the server; the page only shows what comes back.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api(
      '/events' +
        query({
          q: debouncedSearch,
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          type: selectedStatus === 'LIVE' ? 'live' : selectedStatus === 'PORTFOLIO' ? 'portfolio' : undefined,
        }),
      { anonymous: true, signal: controller.signal }
    )
      .then((res) => setEventsList((res.data || []).map(mapBackendEvent)))
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setEventsList([]);
      })
      .finally(() => {
        // A superseded request must not end the loading state of the one that replaced it.
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedSearch, selectedCategory, selectedStatus, propEvents]);

  const filteredEvents = eventsList;

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const categories = categoryIds.map((id) => ({
    id,
    label:
      id === 'ALL'
        ? t('events.all')
        : id === 'CONCERT'
          ? t('events.concert')
          : id === 'PENSI'
            ? t('events.pensi')
            : id === 'BAZAAR'
              ? t('events.bazaar')
              : t('events.expo'),
  }));

  const statusFilters: { id: StatusFilter; label: string; icon: typeof Zap }[] = [
    { id: 'ALL', label: t('eventSearch.allStatus'), icon: CalendarDays },
    { id: 'LIVE', label: t('eventSearch.liveStatus'), icon: Zap },
    { id: 'PORTFOLIO', label: t('eventSearch.portfolioStatus'), icon: Award },
  ];

  return (
    <>
      <SEOHead
        title="Peluang Acara & Festival Musik Indonesia | Event Yuk"
        description={t('eventSearch.description')}
        keywords="proyek konser musik, bazaar kuliner, lowongan kru event, sewa booth, vendor acara"
        canonicalPath="/events"
      />

      <div ref={pageRef} data-ui="event-directory" className="space-y-8 pb-12 sm:space-y-10">

      <section
        aria-labelledby="event-search-title"
        data-gsap-reveal
        className="bg-white px-5 py-7 sm:px-8 sm:py-9"
      >
        <h1
          id="event-search-title"
          className="max-w-[18ch] font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl"
        >
          {t('eventSearch.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          {t('eventSearch.description')}
        </p>

        <div className="mt-7 max-w-4xl">
          <label htmlFor="event-search-query" className="sr-only">
            {t('eventSearch.searchLabel')}
          </label>
          <div className="flex min-h-14 items-center gap-3 border-b-2 border-slate-300 bg-white px-3 focus-within:border-brand-navy">
            <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              id="event-search-query"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('eventSearch.searchPlaceholder')}
              className="min-w-0 flex-1 border-0 bg-transparent py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                aria-label={t('eventSearch.clearSearch')}
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        aria-label={t('eventSearch.filters')}
        data-gsap-reveal
        className="space-y-4 py-2"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter aria-hidden="true" className="h-4 w-4 text-slate-500" />
          <span>{t('eventSearch.filters')}</span>
        </div>

        <div className="flex flex-col gap-5">
          <div
            role="group"
            aria-label={t('eventSearch.statusLabel')}
            className="flex flex-wrap gap-x-5 gap-y-1"
          >
            {statusFilters.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={selectedStatus === id}
                onClick={() => setSelectedStatus(id)}
                className={
                  'inline-flex min-h-11 items-center gap-2 border-b-2 px-1 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ' +
                  (selectedStatus === id
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950')
                }
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label={t('eventSearch.categoryLabel')}
            className="flex flex-wrap gap-x-5 gap-y-1"
          >
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
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm">
          <p className="text-slate-600">
            <span className="font-bold text-slate-950">{filteredEvents.length}</span>{' '}
            {t('eventSearch.resultCount')}
          </p>
          {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 font-semibold text-brand-navy transition hover:bg-brand-navy/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              {t('eventSearch.reset')}
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <div aria-live="polite" aria-busy="true">
          <span className="sr-only">{t('app.loading')}</span>
          <EventCardsSkeletonList count={6} />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 ey-stagger">
          {filteredEvents.map((event) =>
            event.isPortfolio ? (
              <EventCardPortfolio key={event.id} event={event} onViewDetails={onViewDetails} />
            ) : (
              <EventCardLive key={event.id} event={event} onSelectAction={onSelectAction} />
            )
          )}
        </div>
      ) : (
        <EmptyState
          title={t('eventSearch.noResultsTitle')}
          body={t('eventSearch.noResultsDescription')}
          actionLabel={t('eventSearch.reset')}
          onAction={clearFilters}
        />
      )}
      </div>
    </>
  );
}
