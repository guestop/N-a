"use client";

import { use, useEffect, useState } from "react";
import { doc, setDoc, increment } from "firebase/firestore";
import { getAppDoc, getUser, App, User } from "@/lib/firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { AppFrame } from "@/components/viewer/AppFrame";
import { AppHeader } from "@/components/viewer/AppHeader";

export default function AppViewerPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, params is passed as a Promise to Client Components
  const { id } = use(params); 
  
  const [appData, setAppData] = useState<App | null>(null);
  const [publisher, setPublisher] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadApp() {
      try {
        const data = await getAppDoc(id);
        if (!data) {
          if (isMounted) setError("App not found. It may have been deleted or never existed.");
          return;
        }
        if (isMounted) setAppData(data);

        const pub = await getUser(data.publisherId);
        if (isMounted) setPublisher(pub);

        // Track View Count (Once per day per user, entirely local storage + Firestore analytics)
        // This satisfies the "increment only once per user per day" rule without cookies or tracking logic
        const today = new Date().toISOString().split("T")[0];
        const viewKey = `viewed_${id}_${today}`;
        
        if (!localStorage.getItem(viewKey)) {
          localStorage.setItem(viewKey, "true");
          
          // Increment in the globally writable analytics collection instead of apps collection
          // because apps collection strictly requires owner authentication to update
          const analyticsRef = doc(db, "analytics", `${id}_${today}`);
          await setDoc(
            analyticsRef, 
            { appId: id, date: today, views: increment(1) }, 
            { merge: true }
          ).catch((err: unknown) => {
            console.error("Non-critical: failed to record analytics view", err);
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load app data. Please check your connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadApp();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 font-medium text-slate-400 animate-pulse">Initializing Environment...</p>
        </div>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-900 text-center px-4">
        <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">App Unavailable</h2>
        <p className="text-slate-400 max-w-md">{error || "The requested application could not be found."}</p>
      </div>
    );
  }

  return (
    // Uses 100dvh for mobile Safari support instead of h-screen
    <div className="flex flex-col h-[100dvh] w-full bg-slate-900 overflow-hidden">
      <AppHeader app={appData} publisher={publisher} />
      <div className="flex-1 w-full relative">
        <AppFrame url={appData.appUrl} />
      </div>
    </div>
  );
}
