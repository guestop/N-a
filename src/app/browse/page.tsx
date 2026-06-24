import Link from "next/link";
import { Suspense } from "react";
import { getAllApps, SortOption } from "@/lib/firestore/apps";
import { AppCard } from "@/components/app/AppCard";
import { AppGridSkeleton } from "@/components/app/AppGridSkeleton";

export const dynamic = "force-dynamic";

const CATEGORIES = ["All", "Games", "AI", "Tools", "Experiments", "Web Apps"];
const SORTS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Most Viewed", value: "most_viewed" },
  { label: "Most Liked", value: "most_liked" },
];

async function AppGrid({ category, sort, page }: { category: string; sort: SortOption; page: number }) {
  const { apps, hasMore } = await getAllApps(category, sort, page);

  if (apps.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <span className="text-4xl mb-4 block">🔍</span>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No apps found</h3>
        <p className="text-slate-500">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {apps.map(app => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div className="mt-12 flex items-center justify-center gap-4">
        {page > 1 ? (
          <Link
            href={`/browse?category=${encodeURIComponent(category)}&sort=${sort}&page=${page - 1}`}
            className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            ← Previous
          </Link>
        ) : (
          <button disabled className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed">
            ← Previous
          </button>
        )}
        
        <span className="font-medium text-slate-600">Page {page}</span>
        
        {hasMore ? (
          <Link
            href={`/browse?category=${encodeURIComponent(category)}&sort=${sort}&page=${page + 1}`}
            className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Next →
          </Link>
        ) : (
          <button disabled className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// In Next.js 15, searchParams is an asynchronous promise
export default async function BrowsePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  
  const categoryParam = typeof resolvedParams.category === "string" ? resolvedParams.category : "All";
  const sortParam = typeof resolvedParams.sort === "string" && ["newest", "most_viewed", "most_liked"].includes(resolvedParams.sort) 
    ? (resolvedParams.sort as SortOption) 
    : "newest";
  const pageParam = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  
  const category = CATEGORIES.includes(categoryParam) ? categoryParam : "All";
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              U
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Universal Apps</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/publish" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Publish App
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Browse Applications
            </h1>
            <p className="text-slate-600">Discover and run applications instantly.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <div className="relative">
                <select 
                  id="category"
                  defaultValue={category}
                  key={category}
                  className="appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  onChange={(e) => {
                    // Quick client-side navigation using standard window.location to ensure fresh fetch
                    window.location.href = `/browse?category=${encodeURIComponent(e.target.value)}&sort=${sortParam}&page=1`;
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sort" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
              <div className="relative">
                <select 
                  id="sort"
                  defaultValue={sortParam}
                  key={sortParam}
                  className="appearance-none bg-white border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  onChange={(e) => {
                    window.location.href = `/browse?category=${encodeURIComponent(category)}&sort=${e.target.value}&page=1`;
                  }}
                >
                  {SORTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<AppGridSkeleton count={12} />} key={`${category}-${sortParam}-${page}`}>
          <AppGrid category={category} sort={sortParam} page={page} />
        </Suspense>
      </main>
    </div>
  );
}
