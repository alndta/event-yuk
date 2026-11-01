export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Top Banner / Welcome card */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-32 h-6 rounded-full bg-slate-800" />
            <div className="w-64 h-8 rounded-lg bg-slate-800" />
            <div className="w-48 h-4 rounded bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-10 rounded-xl bg-slate-800" />
            <div className="w-32 h-10 rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="w-24 h-3.5 rounded skeleton-shimmer" />
              <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
            </div>
            <div className="w-32 h-7 rounded skeleton-shimmer" />
            <div className="w-20 h-3 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Tab bar placeholder */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-md">
        <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
        <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
        <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
      </div>

      {/* List items placeholder */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="w-40 h-5 rounded skeleton-shimmer" />
          <div className="w-28 h-8 rounded-xl skeleton-shimmer" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="w-48 h-4 rounded skeleton-shimmer" />
              <div className="w-32 h-3 rounded skeleton-shimmer" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-6 rounded-full skeleton-shimmer" />
              <div className="w-28 h-9 rounded-xl skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
