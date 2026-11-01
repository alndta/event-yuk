export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Banner Placeholder */}
        <div className="relative h-48 sm:h-52 skeleton-shimmer overflow-hidden">
          <div className="absolute top-3 left-3 w-28 h-6 rounded-full bg-slate-300/80" />
          <div className="absolute top-3 right-3 w-24 h-6 rounded-full bg-slate-300/80" />
          <div className="absolute bottom-3 left-3.5 right-3.5 space-y-2">
            <div className="w-3/4 h-5 rounded-md bg-slate-300/90" />
            <div className="flex gap-2">
              <div className="w-24 h-3.5 rounded bg-slate-300/80" />
              <div className="w-28 h-3.5 rounded bg-slate-300/80" />
            </div>
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Organizer info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="w-36 h-3.5 rounded skeleton-shimmer" />
              <div className="w-20 h-2.5 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Budget & Progress Box */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="w-24 h-3 rounded skeleton-shimmer" />
              <div className="w-20 h-4 rounded skeleton-shimmer" />
            </div>
            <div className="w-full h-2 rounded-full skeleton-shimmer" />
            <div className="flex justify-between">
              <div className="w-16 h-2.5 rounded skeleton-shimmer" />
              <div className="w-16 h-2.5 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Description line placeholders */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded skeleton-shimmer" />
            <div className="w-4/5 h-3 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Footer Buttons Placeholder */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="h-9 rounded-xl skeleton-shimmer" />
          <div className="h-9 rounded-xl skeleton-shimmer" />
        </div>
        <div className="h-9 rounded-xl skeleton-shimmer mt-2" />
      </div>
    </div>
  );
}

export function EventCardsSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default EventCardSkeleton;
