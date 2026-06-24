"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { db } from "@/lib/firebase/firestore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const auth = getAuth(app);

    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            await setDoc(userRef, { lastLogin: Timestamp.now() }, { merge: true });
          } else {
            await setDoc(userRef, {
              uid: user.uid,
              username: user.displayName || user.email?.split("@")[0] || "User",
              email: user.email || "",
              avatar: user.photoURL || null,
              bio: null,
              createdAt: Timestamp.now(),
              lastLogin: Timestamp.now(),
            });
          }
          if (isMounted) router.push("/");
        } else {
          // If there is no redirect result, they probably shouldn't be here
          if (isMounted) router.push("/");
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to complete authentication.");
          setTimeout(() => router.push("/"), 3000);
        }
      }
    }

    handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      {error ? (
        <div className="text-center text-red-600">
          <p className="font-semibold text-lg">Authentication Error</p>
          <p className="mt-2 text-sm">{error}</p>
          <p className="mt-4 text-xs text-slate-500 animate-pulse">Redirecting to home...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Completing login securely...</p>
        </div>
      )}
    </div>
  );
}
