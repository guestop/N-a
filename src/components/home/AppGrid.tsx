"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, App } from "@/lib/firebase/firestore";
import Link from "next/link";

export function AppGrid() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadApps() {
      try {
        const q = query(
          collection(db, "apps"),
          orderBy("createdAt", "desc"),
          limit(24)
        );
        const snapshot = await getDocs(q);
        const appList: App[] = [];
        snapshot.forEach((doc) => {
          appList.push(doc.data() as App);
        });
        
        if (isMounted) setApps(appList);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load applications.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadApps();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-48 border border-slate-200"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-bold text-slate-700 mb-1">No Apps Published Yet</h3>
        <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">Be the first to publish a web application to the marketplace.</p>
        <Link href="/publish" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Publish an App
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {apps.map((app) => (
        <Link 
          key={app.id} 
          href={`/app/${app.id}`}
          className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
        >
          <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border-b border-slate-100 group-hover:bg-blue-50 transition-colors">
            <span className="text-4xl">🚀</span>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-lg text-slate-900 mb-1 truncate" title={app.title}>{app.title}</h3>
            <div className="flex items-center justify-between mt-4 text-xs font-medium text-slate-500">
              <span className="bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
                {app.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
