export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

const GITHUB_API_URL = "https://api.github.com";

const getHeaders = (token: string) => ({
  Accept: "application/vnd.github.v3+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

const handleRateLimit = (response: Response) => {
  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub API rate limit exceeded. Please try again later.");
  }
};

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const response = await fetch(`${GITHUB_API_URL}/user/repos?sort=updated&per_page=100`, {
    headers: getHeaders(token),
  });
  handleRateLimit(response);
  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchRepoBranches(token: string, owner: string, repo: string): Promise<GitHubBranch[]> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/branches`, {
    headers: getHeaders(token),
  });
  handleRateLimit(response);
  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.statusText}`);
  }
  return response.json();
}

export async function checkIndexHtmlExists(token: string, owner: string, repo: string, branch: string): Promise<boolean> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/index.html?ref=${branch}`, {
    headers: getHeaders(token),
  });
  handleRateLimit(response);
  return response.status === 200;
}

export async function fetchReadmeContent(token: string, owner: string, repo: string): Promise<string | null> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/readme`, {
    headers: {
      ...getHeaders(token),
      Accept: "application/vnd.github.v3.raw",
    },
  });
  handleRateLimit(response);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch README: ${response.statusText}`);
  return response.text();
}
