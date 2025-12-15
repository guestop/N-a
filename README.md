# Chat App Monorepo

TypeScript monorepo for a chat application with public data integration.

## Stack

- **Package manager / workspace:** pnpm workspaces
- **API:** Express (TypeScript) in `apps/server`
- **Web:** React + Vite (TypeScript) in `apps/web`
- **Code quality:** ESLint + Prettier (root config)
- **Public data services:** NewsService, YouTubeService with real-time aggregation

## High-level architecture

- `apps/web` is a React-based chat UI that calls the API with streaming support.
- `apps/server` exposes an HTTP API with:
  - Chat endpoint (`/api/chat`) with streaming responses
  - OpenAI integration (via `OPENAI_API_KEY`)
  - Public data services for news and YouTube channel information
  - Data aggregation for context-aware responses

## Project Structure

```
apps/
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── newsService.ts       # RSS feed scraping with Axios + Cheerio
│   │   │   ├── youtubeService.ts    # YouTube channel info extraction
│   │   │   └── __tests__/           # Service unit tests
│   │   ├── publicDataAggregator.ts  # Combined data aggregation
│   │   ├── types.ts                 # Type definitions
│   │   ├── app.ts                   # Express app setup
│   │   └── index.ts                 # Server entry point
│   └── package.json
├── web/
│   ├── src/
│   │   ├── components/              # React components (Sidebar, Composer, MessageBubble, etc.)
│   │   ├── lib/                     # API client, types, utilities
│   │   ├── stores/                  # Zustand store for chat state
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # App entry point
│   │   └── index.css                # Tailwind CSS styles
│   └── package.json
└── ...
```

## Getting started

### 1) Install dependencies

This repo uses pnpm. If you don't have it yet:

```bash
corepack enable
```

Then install:

```bash
pnpm install
```

### 2) Configure environment variables

Copy the example env files:

```bash
cp .env.example .env
cp .env.example apps/server/.env
cp .env.example apps/web/.env
```

Set required variables:
- `OPENAI_API_KEY` (in `apps/server/.env`) - Required for chat functionality
- `SCRAPING_ENABLED` (optional) - Enable public data services
- `VITE_API_PROXY_TARGET` (in `apps/web/.env`) - API endpoint (default: `http://localhost:3000`)

### 3) Run both services

```bash
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3000 (or configured port)

## Services

### NewsService

Fetches and parses RSS feeds to extract headlines.

**Features:**
- Scrapes BBC News RSS feed (configurable)
- Returns normalized data: `{title, summary, url, timestamp}`
- Limits results to 10 items
- Graceful error handling

### YouTubeService

Extracts contact information from YouTube channel About pages.

**Features:**
- Uses Puppeteer to load channel pages
- Extracts publicly listed emails and contact notes
- Implements throttling and user-agent rotation
- Graceful handling when no contact info exists
- Supports multiple URL formats: `/c/`, `/channel/`, `/user/`, `/@`

### PublicDataAggregator

Combines news and YouTube data based on user queries.

**Features:**
- Extracts YouTube URLs from query text
- Filters news by query relevance
- Aggregates multiple data sources
- Returns errors separately for debugging

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

## Testing

Run tests for services:

```bash
pnpm test
```

## Environment Variables

See `.env.example` for required variables.

Key variables:
- `OPENAI_API_KEY` - OpenAI API key for chat
- `SCRAPING_ENABLED` - Enable public data scraping services
- `VITE_API_PROXY_TARGET` - Frontend API proxy target
