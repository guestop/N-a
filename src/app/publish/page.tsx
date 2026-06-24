"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ZipUploader } from "@/components/publish/ZipUploader";
import { GithubRepoSelector } from "@/components/publish/GithubRepoSelector";
import { GitHubRepo } from "@/lib/github/api";
import { doc, setDoc, Timestamp, collection } from "firebase/firestore";
import { db, App } from "@/lib/firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PublishPage() {
  const { user, githubToken } = useAuth();
  const [method, setMethod] = useState<"zip" | "github" | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Publish Your App</h2>
        <p className="text-slate-600 max-w-md">You need to log in to publish applications to the marketplace. It&apos;s completely free forever.</p>
      </div>
    );
  }

  const handleGithubSelect = async (repo: GitHubRepo) => {
    setIsPublishing(true);
    setError(null);
    try {
      const appRef = doc(collection(db, "apps"));
      const appId = appRef.id;

      // Ensure the URL is correctly constructed for GitHub Pages
      // Assuming username.github.io/repo as standard format
      const appUrl = `https://${repo.owner.login}.github.io/${repo.name}`;

      const newApp: App = {
        id: appId,
        title: repo.name,
        publisherId: user.uid,
        appUrl: appUrl,
        status: "published",
        views: 0,
        createdAt: Timestamp.now(),
      };

      await setDoc(appRef, newApp);
      
      // Redirect to the newly created app viewer page
      router.push(`/app/${appId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish GitHub app");
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Publish an App</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Deploy your web app to the world instantly. No servers to manage, no credit card required.
        </p>
      </div>

      {!method ? (
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMethod("github")}
            className="flex flex-col items-center p-8 bg-white border border-slate-200 rounded-2xl hover:border-slate-800 hover:shadow-lg transition-all text-center group"
          >
            <div className="w-16 h-16 bg-slate-100 group-hover:bg-slate-800 group-hover:text-white text-slate-700 rounded-full flex items-center justify-center mb-6 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connect GitHub Repo</h3>
            <p className="text-slate-500 text-sm">Automatically deploy your app from a public GitHub repository using GitHub Pages.</p>
          </button>

          <button
            onClick={() => setMethod("zip")}
            className="flex flex-col items-center p-8 bg-white border border-slate-200 rounded-2xl hover:border-blue-600 hover:shadow-lg transition-all text-center group"
          >
            <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 rounded-full flex items-center justify-center mb-6 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Upload ZIP File</h3>
            <p className="text-slate-500 text-sm">Drag and drop a .zip file containing your static website (must include index.html).</p>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {method === "github" ? "Connect GitHub Repository" : "Upload ZIP Archive"}
            </h2>
            <button
              onClick={() => setMethod(null)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              ← Choose different method
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <span className="font-semibold block mb-1">Publishing Error</span>
              {error}
            </div>
          )}

          {isPublishing ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
              <p className="font-medium text-slate-700">Publishing your application...</p>
            </div>
          ) : method === "github" ? (
            githubToken ? (
              <GithubRepoSelector githubToken={githubToken} onSelect={handleGithubSelect} />
            ) : (
              <div className="text-center py-8">
                <p className="text-amber-600 font-medium mb-4">GitHub authentication token missing.</p>
                <p className="text-slate-500 text-sm mb-6">You must log in with GitHub to access your repositories.</p>
                <Link href="/" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                  Return Home
                </Link>
              </div>
            )
          ) : (
            <ZipUploader />
          )}
        </div>
      )}
    </div>
  );
}
