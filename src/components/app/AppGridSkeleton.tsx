export function AppGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="h-40 w-full bg-slate-200"></div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
            <div className="mt-auto flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
