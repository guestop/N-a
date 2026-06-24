const GITHUB_API_URL = "https://api.github.com";

export async function setupGithubWebhook(
  token: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
): Promise<void> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/hooks`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: webhookUrl,
        content_type: "json",
        secret: secret,
        insecure_ssl: "0",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.errors?.[0]?.message === "Hook already exists on this repository") {
      return; // Hook is already setup, no need to throw an error
    }
    throw new Error(`Failed to setup webhook: ${response.statusText}`);
  }
}
