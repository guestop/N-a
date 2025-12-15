import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsItem } from '../types';

const RSS_FEED_URL = 'https://feeds.bbc.co.uk/news/rss.xml';

export class NewsService {
  async fetchTodayHeadlines(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(RSS_FEED_URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: NewsItem[] = [];

      $('item').each((_, element) => {
        const titleElem = $(element).find('title').first();
        const descElem = $(element).find('description').first();
        const linkElem = $(element).find('link').first();
        const pubDateElem = $(element).find('pubDate').first();

        const title = titleElem.text().trim();
        const summary = descElem.text().trim().substring(0, 500);
        const url = linkElem.text().trim();
        const pubDateStr = pubDateElem.text().trim();

        if (title && url) {
          const timestamp = pubDateStr
            ? new Date(pubDateStr)
            : new Date();

          items.push({
            title,
            summary,
            url,
            timestamp
          });
        }
      });

      return items.slice(0, 10);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch news headlines: ${errorMessage}`);
    }
  }
}

export const newsService = new NewsService();
