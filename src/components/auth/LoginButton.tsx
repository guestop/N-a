"use client";

import { useState } from "react";
import { signInWithGithub, logout } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
  const { user, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError(null);
      await signInWithGithub();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-md bg-slate-200"></div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {user.photoURL && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.photoURL}
            alt="Avatar"
            className="h-8 w-8 rounded-full border border-slate-300"
          />
        )}
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="inline-flex items-center gap-2 rounded-md bg-[#24292F] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#24292F]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F] disabled:opacity-50"
      >
        {isLoggingIn ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        )}
        Sign in with GitHub
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
