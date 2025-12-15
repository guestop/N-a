import 'dotenv/config';

import { createApp } from './app.js';

// Export services and types for use as a library
export { NewsService, newsService } from './services/newsService.js';
export { YoutubeService, youtubeService } from './services/youtubeService.js';
export { PublicDataAggregator, publicDataAggregator } from './publicDataAggregator.js';
export type {
  NewsItem,
  YoutubeContactInfo,
  YoutubeChannelData,
  PublicDataAggregatorResult,
  ServiceError
} from './types.js';

// Start the server
const port = Number(process.env.SERVER_PORT ?? 3001);

const app = createApp();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
