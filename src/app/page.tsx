import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedApps, getNewApps } from "@/lib/firestore/apps";
import { AppCard } from "@/components/app/AppCard";
import { AppGridSkeleton } from "@/components/app/AppGridSkeleton";

export const dynamic = "force-dynamic"; // Ensure fresh data on home page

async function FeaturedApps() {
  const apps = await getFeaturedApps();
  if (apps.length === 0) {
    return <p className="text-slate-500 text-sm">No featured apps yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}

async function NewApps() {
  const apps = await getNewApps();
  if (apps.length === 0) {
    return <p className="text-slate-500 text-sm">No new apps yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apps.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}

const CATEGORIES = ["Games", "AI", "Tools", "Experiments", "Web Apps"];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              U
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Universal Apps</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/browse" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Browse
            </Link>
            <Link href="/publish" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Publish App
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Discover Web Apps. <br className="hidden sm:block"/> No Downloads Required.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              A universal marketplace where you can run any application instantly in your browser. Forever free, zero installations, and strictly sandboxed for your security.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/browse" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all text-lg">
                Explore Apps
              </Link>
              <Link href="/publish" className="px-8 py-3.5 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-lg">
                Start Publishing
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories Row */}
          <section className="mb-16">
            <h2 className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/browse" className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm">
                All Apps
              </Link>
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/browse?category=${encodeURIComponent(cat)}`} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm">
                  {cat}
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Apps (Top 6) */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                🔥 Featured Apps
              </h2>
            </div>
            <Suspense fallback={<AppGridSkeleton count={6} />}>
              <FeaturedApps />
            </Suspense>
          </section>

          {/* New Apps (Latest 8) */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                ✨ New Arrivals
              </h2>
              <Link href="/browse?sort=newest" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                View all →
              </Link>
            </div>
            <Suspense fallback={<AppGridSkeleton count={8} />}>
              <NewApps />
            </Suspense>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 Universal Apps. Built for the modern web.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Publishers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
