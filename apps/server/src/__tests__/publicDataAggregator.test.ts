import { PublicDataAggregator } from '../publicDataAggregator';
import * as newsServiceModule from '../services/newsService';
import * as youtubeServiceModule from '../services/youtubeService';

jest.mock('../services/newsService');
jest.mock('../services/youtubeService');

const mockNewsService = newsServiceModule.newsService as jest.Mocked<
  typeof newsServiceModule.newsService
>;
const mockYoutubeService = youtubeServiceModule.youtubeService as jest.Mocked<
  typeof youtubeServiceModule.youtubeService
>;

describe('PublicDataAggregator', () => {
  let aggregator: PublicDataAggregator;

  beforeEach(() => {
    jest.clearAllMocks();
    aggregator = new PublicDataAggregator();
    
    mockNewsService.fetchTodayHeadlines = jest.fn();
    mockYoutubeService.extractChannelContactInfo = jest.fn();
  });

  describe('aggregatePublicData', () => {
    it('should aggregate news and youtube data successfully', async () => {
      const mockNews = [
        {
          title: 'Technology news',
          summary: 'Latest tech developments',
          url: 'https://example.com/tech-news',
          timestamp: new Date()
        },
        {
          title: 'Sports news',
          summary: 'Sports updates',
          url: 'https://example.com/sports-news',
          timestamp: new Date()
        }
      ];

      const mockYoutubeData = {
        channelId: 'testchannel',
        channelName: 'Test Channel',
        contactInfo: {
          emails: ['contact@example.com'],
          contactNotes: ['For inquiries contact us']
        }
      };

      mockNewsService.fetchTodayHeadlines.mockResolvedValue(mockNews);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(
        mockYoutubeData
      );

      const result = await aggregator.aggregatePublicData(
        'technology https://www.youtube.com/c/testchannel'
      );

      expect(result.data.news).toHaveLength(1);
      expect(result.data.news[0].title).toBe('Technology news');
      expect(result.data.youtubeData).toHaveLength(1);
      expect(result.data.youtubeData[0].channelId).toBe('testchannel');
      expect(result.errors).toHaveLength(0);
    });

    it('should filter news by query relevance', async () => {
      const mockNews = [
        {
          title: 'Python programming guide',
          summary: 'Learn Python basics',
          url: 'https://example.com/python',
          timestamp: new Date()
        },
        {
          title: 'JavaScript tips',
          summary: 'JavaScript best practices',
          url: 'https://example.com/javascript',
          timestamp: new Date()
        },
        {
          title: 'Python advanced techniques',
          summary: 'Advanced Python programming',
          url: 'https://example.com/python-advanced',
          timestamp: new Date()
        }
      ];

      mockNewsService.fetchTodayHeadlines.mockResolvedValue(mockNews);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const result = await aggregator.aggregatePublicData('Python');

      expect(result.data.news).toHaveLength(2);
      expect(result.data.news.every((n) =>
        n.title.toLowerCase().includes('python')
      )).toBe(true);
    });

    it('should handle news service failure gracefully', async () => {
      mockNewsService.fetchTodayHeadlines.mockRejectedValue(
        new Error('Network error')
      );
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const result = await aggregator.aggregatePublicData('query');

      expect(result.data.news).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].service).toBe('newsService');
      expect(result.errors[0].error).toBe('Failed to fetch news');
      expect(result.errors[0].details).toContain('Network error');
    });

    it('should handle youtube service failure gracefully', async () => {
      mockNewsService.fetchTodayHeadlines.mockResolvedValue([]);
      mockYoutubeService.extractChannelContactInfo.mockRejectedValue(
        new Error('Puppeteer error')
      );

      const result = await aggregator.aggregatePublicData(
        'https://www.youtube.com/c/testchannel'
      );

      expect(result.data.youtubeData).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].service).toBe('youtubeService');
      expect(result.errors[0].details).toContain('Puppeteer error');
    });

    it('should handle multiple youtube channels in query', async () => {
      mockNewsService.fetchTodayHeadlines.mockResolvedValue([]);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue({
        channelId: 'testchannel',
        channelName: 'Test Channel',
        contactInfo: {
          emails: [],
          contactNotes: []
        }
      });

      const result = await aggregator.aggregatePublicData(
        'https://www.youtube.com/c/channel1 https://www.youtube.com/c/channel2'
      );

      expect(result.data.youtubeData).toHaveLength(2);
      expect(mockYoutubeService.extractChannelContactInfo).toHaveBeenCalledTimes(2);
    });

    it('should extract youtube URLs from query correctly', async () => {
      mockNewsService.fetchTodayHeadlines.mockResolvedValue([]);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const query = `
        Check out https://www.youtube.com/c/techchannel and 
        https://www.youtube.com/channel/UCxyz123
      `;

      await aggregator.aggregatePublicData(query);

      expect(mockYoutubeService.extractChannelContactInfo).toHaveBeenCalledTimes(2);
      expect(mockYoutubeService.extractChannelContactInfo).toHaveBeenCalledWith(
        'https://www.youtube.com/c/techchannel'
      );
      expect(mockYoutubeService.extractChannelContactInfo).toHaveBeenCalledWith(
        'https://www.youtube.com/channel/UCxyz123'
      );
    });

    it('should return timestamp with aggregated data', async () => {
      mockNewsService.fetchTodayHeadlines.mockResolvedValue([]);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const before = new Date();
      const result = await aggregator.aggregatePublicData('query');
      const after = new Date();

      expect(result.data.timestamp).toBeInstanceOf(Date);
      expect(result.data.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(result.data.timestamp.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });

    it('should handle multiple simultaneous failures', async () => {
      mockNewsService.fetchTodayHeadlines.mockRejectedValue(
        new Error('News service down')
      );
      mockYoutubeService.extractChannelContactInfo.mockRejectedValue(
        new Error('YouTube service down')
      );

      const result = await aggregator.aggregatePublicData(
        'query https://www.youtube.com/c/channel'
      );

      expect(result.errors).toHaveLength(2);
      expect(result.data.news).toHaveLength(0);
      expect(result.data.youtubeData).toHaveLength(0);
    });

    it('should filter news with case-insensitive matching', async () => {
      const mockNews = [
        {
          title: 'TECHNOLOGY NEWS',
          summary: 'Tech updates',
          url: 'https://example.com/1',
          timestamp: new Date()
        },
        {
          title: 'Sports news',
          summary: 'SPORTS UPDATES',
          url: 'https://example.com/2',
          timestamp: new Date()
        }
      ];

      mockNewsService.fetchTodayHeadlines.mockResolvedValue(mockNews);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const result = await aggregator.aggregatePublicData('TECH');

      expect(result.data.news).toHaveLength(1);
      expect(result.data.news[0].title).toBe('TECHNOLOGY NEWS');
    });

    it('should handle empty query gracefully', async () => {
      mockNewsService.fetchTodayHeadlines.mockResolvedValue([
        {
          title: 'News 1',
          summary: 'Summary 1',
          url: 'https://example.com/1',
          timestamp: new Date()
        }
      ]);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const result = await aggregator.aggregatePublicData('');

      // With empty query, no news should match (no query terms to match against)
      expect(result.data.news).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should not crash with malformed youtube URLs', async () => {
      mockNewsService.fetchTodayHeadlines.mockResolvedValue([]);
      mockYoutubeService.extractChannelContactInfo.mockResolvedValue(null);

      const result = await aggregator.aggregatePublicData(
        'Check https://example.com and some random text'
      );

      expect(result.errors).toHaveLength(0);
      expect(mockYoutubeService.extractChannelContactInfo).not.toHaveBeenCalled();
    });
  });
});
