export function PartnerCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header with avatar */}
        <div className="p-5 flex items-start gap-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl skeleton-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 rounded-full skeleton-shimmer" />
              <div className="w-12 h-4 rounded skeleton-shimmer" />
            </div>
            <div className="w-40 h-4 rounded skeleton-shimmer" />
            <div className="w-28 h-3 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Pricing & description */}
        <div className="p-5 space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
            <div className="w-28 h-3 rounded skeleton-shimmer" />
            <div className="w-24 h-3.5 rounded skeleton-shimmer" />
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-3 rounded skeleton-shimmer" />
            <div className="w-3/4 h-3 rounded skeleton-shimmer" />
          </div>

          {/* Specs tags */}
          <div className="pt-2 space-y-1.5">
            <div className="w-24 h-2.5 rounded skeleton-shimmer" />
            <div className="flex flex-wrap gap-1.5">
              <div className="w-32 h-5 rounded-md skeleton-shimmer" />
              <div className="w-28 h-5 rounded-md skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-5 pt-0 border-t border-slate-100 mt-2">
        <div className="h-10 rounded-xl skeleton-shimmer mt-4" />
      </div>
    </div>
  );
}

export function PartnerCardsSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PartnerCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default PartnerCardSkeleton;
