import cors from 'cors';
import express from 'express';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? '*',
    })
  );

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'server',
      scrapingEnabled: process.env.SCRAPING_ENABLED === 'true',
    });
  });

  app.get('/', (_req, res) => {
    res.type('text/plain').send('Chat API (placeholder)');
  });

  return app;
}
