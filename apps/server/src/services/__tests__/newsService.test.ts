import { NewsService } from '../newsService';
import axios from 'axios';

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('NewsService', () => {
  let newsService: NewsService;

  beforeEach(() => {
    newsService = new NewsService();
    jest.clearAllMocks();
  });

  describe('fetchTodayHeadlines', () => {
    it('should fetch and parse RSS feed successfully', async () => {
      const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test News 1</title>
              <description>Summary of test news 1</description>
              <link>https://example.com/news1</link>
              <pubDate>Mon, 15 Dec 2024 10:00:00 GMT</pubDate>
            </item>
            <item>
              <title>Test News 2</title>
              <description>Summary of test news 2</description>
              <link>https://example.com/news2</link>
              <pubDate>Mon, 15 Dec 2024 09:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockAxios.get.mockResolvedValue({ data: mockRSSData });

      const result = await newsService.fetchTodayHeadlines();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: 'Test News 1',
        summary: 'Summary of test news 1',
        url: 'https://example.com/news1',
        timestamp: expect.any(Date)
      });
      expect(result[1]).toEqual({
        title: 'Test News 2',
        summary: 'Summary of test news 2',
        url: 'https://example.com/news2',
        timestamp: expect.any(Date)
      });
    });

    it('should return limited number of items (max 10)', async () => {
      const items = Array.from({ length: 15 }, (_, i) => `
        <item>
          <title>News ${i + 1}</title>
          <description>Summary ${i + 1}</description>
          <link>https://example.com/news${i + 1}</link>
          <pubDate>Mon, 15 Dec 2024 10:00:00 GMT</pubDate>
        </item>
      `).join('');

      const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            ${items}
          </channel>
        </rss>`;

      mockAxios.get.mockResolvedValue({ data: mockRSSData });

      const result = await newsService.fetchTodayHeadlines();

      expect(result).toHaveLength(10);
    });

    it('should handle items with missing fields gracefully', async () => {
      const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Valid News</title>
              <description>Summary</description>
              <link>https://example.com/valid</link>
              <pubDate>Mon, 15 Dec 2024 10:00:00 GMT</pubDate>
            </item>
            <item>
              <title>No URL News</title>
              <description>Summary</description>
              <link></link>
            </item>
            <item>
              <description>No Title News</description>
              <link>https://example.com/no-title</link>
            </item>
          </channel>
        </rss>`;

      mockAxios.get.mockResolvedValue({ data: mockRSSData });

      const result = await newsService.fetchTodayHeadlines();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Valid News');
    });

    it('should handle missing pubDate with current date', async () => {
      const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>News Without Date</title>
              <description>Summary</description>
              <link>https://example.com/no-date</link>
            </item>
          </channel>
        </rss>`;

      mockAxios.get.mockResolvedValue({ data: mockRSSData });

      const result = await newsService.fetchTodayHeadlines();

      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBeDefined();
      expect(result[0].timestamp).toBeInstanceOf(Date);
    });

    it('should truncate long summaries to 500 characters', async () => {
      const longSummary = 'a'.repeat(1000);
      const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>News with Long Summary</title>
              <description>${longSummary}</description>
              <link>https://example.com/long</link>
              <pubDate>Mon, 15 Dec 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockAxios.get.mockResolvedValue({ data: mockRSSData });

      const result = await newsService.fetchTodayHeadlines();

      expect(result[0].summary.length).toBe(500);
    });

    it('should throw error when axios fails', async () => {
      mockAxios.get.mockRejectedValue(
        new Error('Network error')
      );

      await expect(newsService.fetchTodayHeadlines()).rejects.toThrow(
        'Failed to fetch news headlines: Network error'
      );
    });

    it('should handle timeout errors gracefully', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      mockAxios.get.mockRejectedValue(timeoutError);

      await expect(newsService.fetchTodayHeadlines()).rejects.toThrow(
        'Failed to fetch news headlines: timeout of 10000ms exceeded'
      );
    });

    it('should set proper User-Agent header', async () => {
      const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0"><channel></channel></rss>`;

      mockAxios.get.mockResolvedValue({ data: mockRSSData });

      await newsService.fetchTodayHeadlines();

      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String)
          })
        })
      );
    });
  });
});
