"use client";

import { App, User } from "@/lib/firebase/firestore";
import { useState } from "react";
import Link from "next/link";

interface AppHeaderProps {
  app: App;
  publisher: User | null;
}

export function AppHeader({ app, publisher }: AppHeaderProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 text-white shadow-md z-10">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="font-semibold text-sm md:text-base leading-tight truncate max-w-[200px] md:max-w-md" title={app.title}>
            {app.title}
          </h1>
          <p className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-md">
            by {publisher?.username || "Unknown Publisher"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setLiked(!liked)}
          className={`p-2 rounded-md transition-colors ${liked ? "text-pink-500 bg-pink-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          aria-label="Like"
        >
          <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button 
          onClick={handleShare}
          className="p-2 text-slate-400 rounded-md hover:bg-slate-800 hover:text-white transition-colors relative"
          aria-label="Share"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
