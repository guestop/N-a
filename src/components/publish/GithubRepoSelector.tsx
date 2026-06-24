"use client";

import { useState, useEffect } from "react";
import { 
  GitHubRepo, 
  GitHubBranch, 
  fetchUserRepos, 
  fetchRepoBranches, 
  checkIndexHtmlExists, 
  fetchReadmeContent 
} from "@/lib/github/api";

interface GithubRepoSelectorProps {
  githubToken: string;
  onSelect: (repo: GitHubRepo, branch: string, description: string | null) => void;
}

export function GithubRepoSelector({ githubToken, onSelect }: GithubRepoSelectorProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [checkingBranch, setCheckingBranch] = useState(false);
  const [indexWarning, setIndexWarning] = useState(false);

  useEffect(() => {
    async function loadRepos() {
      try {
        const data = await fetchUserRepos(githubToken);
        // Exclude private repos as they cannot be deployed securely in a free tier browser-only runtime
        setRepos(data.filter(r => !r.private));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load repos");
      } finally {
        setLoading(false);
      }
    }
    loadRepos();
  }, [githubToken]);

  const handleRepoSelect = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedBranch("");
    setIndexWarning(false);
    setCheckingBranch(true);
    
    try {
      const branchData = await fetchRepoBranches(githubToken, repo.owner.login, repo.name);
      setBranches(branchData);
      
      const defaultBranch = branchData.find(b => b.name === "main" || b.name === "master");
      if (defaultBranch) {
        await handleBranchSelect(defaultBranch.name, repo);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load branches");
    } finally {
      setCheckingBranch(false);
    }
  };

  const handleBranchSelect = async (branch: string, repo: GitHubRepo | null = selectedRepo) => {
    if (!repo) return;
    
    setSelectedBranch(branch);
    setCheckingBranch(true);
    setIndexWarning(false);

    try {
      const hasIndex = await checkIndexHtmlExists(githubToken, repo.owner.login, repo.name, branch);
      if (!hasIndex) {
        setIndexWarning(true);
      }

      const readme = await fetchReadmeContent(githubToken, repo.owner.login, repo.name);
      onSelect(repo, branch, readme);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : "Error validating branch");
    } finally {
      setCheckingBranch(false);
    }
  };

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="animate-pulse h-32 w-full bg-slate-200 rounded-xl" />;
  if (error) return <div className="text-red-600 font-medium text-sm p-4 bg-red-50 border border-red-200 rounded-lg">{error}</div>;

  return (
    <div className="w-full max-w-2xl border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">Select GitHub Repository</h3>
      
      {!selectedRepo ? (
        <>
          <input
            type="text"
            placeholder="Search your public repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
            {filteredRepos.length === 0 ? (
              <p className="p-8 text-slate-500 text-center text-sm">No public repositories found.</p>
            ) : (
              filteredRepos.map(repo => (
                <button
                  key={repo.id}
                  onClick={() => handleRepoSelect(repo)}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-800">{repo.name}</span>
                  {repo.description && <p className="text-xs text-slate-500 truncate mt-1">{repo.description}</p>}
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Selected Repository</p>
              <span className="font-semibold text-slate-900">{selectedRepo.full_name}</span>
            </div>
            <button 
              onClick={() => setSelectedRepo(null)} 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50"
            >
              Change Repo
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Deployment Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchSelect(e.target.value)}
              disabled={checkingBranch}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="" disabled>Select a branch...</option>
              {branches.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {checkingBranch && (
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500 animate-pulse bg-slate-50 p-3 rounded-md">
              <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              Scanning branch for index.html...
            </div>
          )}

          {indexWarning && !checkingBranch && selectedBranch && (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200 flex gap-3">
              <svg className="w-5 h-5 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <span className="font-semibold block mb-0.5">Warning: No index.html found</span>
                <p>We couldn&apos;t find an <code>index.html</code> file in the root of the <code>{selectedBranch}</code> branch. Your app will likely fail to run correctly.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
