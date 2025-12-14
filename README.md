# Chat App Monorepo

TypeScript monorepo for a chat application.

## Stack

- **Package manager / workspace:** pnpm workspaces
- **API:** Express (TypeScript) in `apps/server`
- **Web:** React + Vite (TypeScript) in `apps/web`
- **Code quality:** ESLint + Prettier (root config)

## High-level architecture

- `apps/web` is a thin UI that calls the API.
- `apps/server` exposes an HTTP API (placeholder today) and will be the integration point for:
  - OpenAI requests (via `OPENAI_API_KEY`)
  - optional scraping / ingestion workflows (gated by `SCRAPING_ENABLED`)

## Getting started

### 1) Install dependencies

This repo uses pnpm. If you don’t have it yet:

```bash
corepack enable
```

Then install:

```bash
pnpm install
```

### 2) Configure environment variables

Copy the example env file into each app:

```bash
cp .env.example apps/server/.env
cp .env.example apps/web/.env
```

(You can also create app-specific `.env` files; the example is intentionally shared.)

### 3) Run both services

```bash
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001/health

## Useful commands

- `pnpm dev` – run API + web in watch mode
- `pnpm build` – typecheck + build both apps
- `pnpm lint` – lint + prettier check
- `pnpm test` – run unit tests in each app

Run a single app:

```bash
pnpm dev:server
pnpm dev:web
```
