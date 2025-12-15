# Public Data Services

A modular monorepo for public data retrieval services including news aggregation and YouTube channel data extraction.

## Structure

```
apps/
├── server/
    ├── src/
    │   ├── services/
    │   │   ├── newsService.ts       # RSS feed scraping with Axios + Cheerio
    │   │   ├── youtubeService.ts    # YouTube channel info extraction with Puppeteer
    │   │   └── __tests__/           # Service unit tests
    │   ├── publicDataAggregator.ts  # Combined news + YouTube data aggregation
    │   ├── types.ts                 # TypeScript type definitions
    │   └── index.ts                 # Service exports
```

## Services

### NewsService

Fetches and parses RSS feeds to extract today's headlines.

**Features:**
- Scrapes BBC News RSS feed (configurable)
- Returns normalized data: `{title, summary, url, timestamp}`
- Limits results to 10 items
- Graceful error handling

**Usage:**
```typescript
import { newsService } from '@public-data-services/server';

const headlines = await newsService.fetchTodayHeadlines();
```

### YoutubeService

Extracts contact information from YouTube channel About pages.

**Features:**
- Uses Puppeteer to load channel About pages
- Extracts publicly listed emails and contact notes
- Includes throttling (2000-5000ms random delays between requests)
- Implements user-agent rotation (5 different user agents)
- Graceful handling when no contact info exists
- Supports multiple URL formats: `/c/`, `/channel/`, `/user/`, `/@`

**Usage:**
```typescript
import { youtubeService } from '@public-data-services/server';

const channelData = await youtubeService.extractChannelContactInfo(
  'https://www.youtube.com/c/channelname'
);
```

### PublicDataAggregator

Combines news and YouTube data based on user queries.

**Features:**
- Extracts YouTube URLs from query text
- Filters news by query relevance
- Aggregates multiple data sources
- Returns errors separately for debugging
- Supports simultaneous failures

**Usage:**
```typescript
import { publicDataAggregator } from '@public-data-services/server';

const result = await publicDataAggregator.aggregatePublicData(
  'technology https://www.youtube.com/c/techchannel'
);
// result.data contains combined news + YouTube data
// result.errors contains any service errors
```

## Testing

Comprehensive unit and integration tests with mocked services.

```bash
npm test
```

**Test Coverage:**
- NewsService: 8 tests
  - RSS feed parsing
  - Error handling
  - Data normalization
  - User-Agent headers

- YoutubeService: 10 tests
  - Email and contact info extraction
  - URL format handling
  - Throttling behavior
  - User-agent rotation
  - Browser error handling

- PublicDataAggregator: 10 tests
  - Data aggregation
  - Query filtering
  - Error handling
  - URL extraction

## Installation

```bash
npm install
npm install -w apps/server
```

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report
```

## Type Definitions

All services are fully typed:

```typescript
// Types
NewsItem {
  title: string
  summary: string
  url: string
  timestamp: Date
}

YoutubeContactInfo {
  emails: string[]
  contactNotes: string[]
}

YoutubeChannelData {
  channelId: string
  channelName: string
  contactInfo: YoutubeContactInfo
}

PublicDataAggregatorResult {
  news: NewsItem[]
  youtubeData: YoutubeChannelData[]
  timestamp: Date
}

ServiceError {
  service: string
  error: string
  details?: string
}
```

## Error Handling

All services handle failures gracefully:
- Network errors are caught and reported
- Timeouts have fallback behavior
- Browser crashes are handled safely
- Missing data returns empty arrays instead of errors
- Aggregator returns errors in separate field
