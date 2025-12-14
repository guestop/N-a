import { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function App() {
  const [health, setHealth] = useState<string>('');

  async function checkHealth() {
    setHealth('Loading...');
    try {
      const res = await fetch(`${apiUrl}/health`);
      const json = (await res.json()) as { ok: boolean };
      setHealth(json.ok ? 'OK' : 'Not OK');
    } catch (err) {
      setHealth(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return (
    <main className="container">
      <h1>Chat App (placeholder)</h1>
      <p>
        API URL: <code>{apiUrl}</code>
      </p>

      <button type="button" onClick={checkHealth}>
        Check API health
      </button>

      {health ? (
        <p>
          Health: <strong>{health}</strong>
        </p>
      ) : null}
    </main>
  );
}
