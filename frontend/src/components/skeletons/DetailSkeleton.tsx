export function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 font-sans">
      {/* Back button & breadcrumbs placeholder */}
      <div className="flex items-center gap-2">
        <div className="w-24 h-4 rounded skeleton-shimmer" />
        <div className="w-4 h-4 rounded skeleton-shimmer" />
        <div className="w-36 h-4 rounded skeleton-shimmer" />
      </div>

      {/* Hero Header Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-28 h-6 rounded-full skeleton-shimmer" />
              <div className="w-24 h-6 rounded-full skeleton-shimmer" />
            </div>
            <div className="w-3/4 h-8 sm:h-10 rounded-lg skeleton-shimmer" />
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="w-36 h-4 rounded skeleton-shimmer" />
              <div className="w-40 h-4 rounded skeleton-shimmer" />
              <div className="w-32 h-4 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="w-40 h-12 rounded-2xl skeleton-shimmer shrink-0" />
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-20 h-3 rounded skeleton-shimmer" />
              <div className="w-28 h-5 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Main details & tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs bar */}
          <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
            <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
            <div className="flex-1 h-9 rounded-xl skeleton-shimmer" />
          </div>

          {/* Large Content Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="w-48 h-5 rounded skeleton-shimmer" />
            <div className="space-y-2">
              <div className="w-full h-3.5 rounded skeleton-shimmer" />
              <div className="w-full h-3.5 rounded skeleton-shimmer" />
              <div className="w-4/5 h-3.5 rounded skeleton-shimmer" />
            </div>
            <div className="pt-4 space-y-3">
              <div className="w-36 h-4 rounded skeleton-shimmer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-16 rounded-2xl skeleton-shimmer" />
                <div className="h-16 rounded-2xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sticky Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div className="w-36 h-5 rounded skeleton-shimmer" />
            <div className="space-y-3">
              <div className="h-11 rounded-2xl skeleton-shimmer" />
              <div className="h-11 rounded-2xl skeleton-shimmer" />
              <div className="h-11 rounded-2xl skeleton-shimmer" />
            </div>
            <div className="h-12 rounded-2xl skeleton-shimmer mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailSkeleton;
