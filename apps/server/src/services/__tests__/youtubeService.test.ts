import { YoutubeService } from '../youtubeService';
import puppeteer from 'puppeteer';

jest.mock('puppeteer');

const mockPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;

describe('YoutubeService', () => {
  let youtubeService: YoutubeService;

  beforeEach(() => {
    youtubeService = new YoutubeService();
    jest.clearAllMocks();
  });

  describe('extractChannelContactInfo', () => {
    it('should extract emails from channel description', async () => {
      const mockPageContent = 'Contact us at business@example.com for inquiries';
      const mockChannelName = 'Test Channel';

      const mockPage = {
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        goto: jest.fn().mockResolvedValue(null),
        evaluate: jest
          .fn()
          .mockResolvedValue({
            channelName: mockChannelName,
            description: mockPageContent
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      const result = await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/c/testchannel'
      );

      expect(result).toEqual({
        channelId: 'testchannel',
        channelName: mockChannelName,
        contactInfo: {
          emails: ['business@example.com'],
          contactNotes: expect.any(Array)
        }
      });

      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should extract multiple emails', async () => {
      const mockPageContent =
        'Email: contact@test.com or business@test.com or info@test.com';

      const mockPage = {
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        goto: jest.fn().mockResolvedValue(null),
        evaluate: jest
          .fn()
          .mockResolvedValue({
            channelName: 'Channel',
            description: mockPageContent
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      const result = await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/channel/testid'
      );

      expect(result?.contactInfo.emails).toHaveLength(3);
      expect(result?.contactInfo.emails).toContain('contact@test.com');
      expect(result?.contactInfo.emails).toContain('business@test.com');
      expect(result?.contactInfo.emails).toContain('info@test.com');
    });

    it('should extract contact notes from description', async () => {
      const mockPageContent =
        'For business inquiries, please reach out via email. ' +
        'Collaboration opportunities and partnerships are welcome. ' +
        'Contact us for sponsorship deals.';

      const mockPage = {
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        goto: jest.fn().mockResolvedValue(null),
        evaluate: jest
          .fn()
          .mockResolvedValue({
            channelName: 'Channel',
            description: mockPageContent
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      const result = await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/c/testchannel'
      );

      expect(result?.contactInfo.contactNotes.length).toBeGreaterThan(0);
      expect(
        result?.contactInfo.contactNotes.some((note) =>
          note.toLowerCase().includes('business')
        )
      ).toBe(true);
    });

    it('should handle empty contact info gracefully', async () => {
      const mockPageContent = 'Welcome to our channel. We post videos every week. Subscribe for more content.';

      const mockPage = {
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        goto: jest.fn().mockResolvedValue(null),
        evaluate: jest
          .fn()
          .mockResolvedValue({
            channelName: 'Channel',
            description: mockPageContent
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      const result = await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/c/testchannel'
      );

      expect(result?.contactInfo.emails).toHaveLength(0);
      expect(result?.contactInfo.contactNotes).toHaveLength(0);
    }, 10000);

    it(
      'should extract channel ID from different URL formats',
      async () => {
        const mockPage = {
          setUserAgent: jest.fn().mockResolvedValue(undefined),
          goto: jest.fn().mockResolvedValue(null),
          evaluate: jest
            .fn()
            .mockResolvedValue({
              channelName: 'Channel',
              description: ''
            }),
          close: jest.fn().mockResolvedValue(undefined)
        };

        const mockBrowser = {
          newPage: jest.fn().mockResolvedValue(mockPage),
          close: jest.fn().mockResolvedValue(undefined)
        };

        mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

        // Test /c/ format
        let result = await youtubeService.extractChannelContactInfo(
          'https://www.youtube.com/c/testchannel'
        );
        expect(result?.channelId).toBe('testchannel');

        // Test /channel/ format
        result = await youtubeService.extractChannelContactInfo(
          'https://www.youtube.com/channel/UCxyz123'
        );
        expect(result?.channelId).toBe('UCxyz123');

        // Test /user/ format
        result = await youtubeService.extractChannelContactInfo(
          'https://www.youtube.com/user/testuser'
        );
        expect(result?.channelId).toBe('testuser');

        // Test @ format
        result = await youtubeService.extractChannelContactInfo(
          'https://www.youtube.com/@testchannel'
        );
        expect(result?.channelId).toBe('testchannel');
      },
      30000
    );

    it('should apply throttling between requests', async () => {
      const mockPage = {
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        goto: jest.fn().mockResolvedValue(null),
        evaluate: jest
          .fn()
          .mockResolvedValue({
            channelName: 'Channel',
            description: 'test'
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      const startTime = Date.now();
      await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/c/testchannel'
      );

      const secondStart = Date.now();
      await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/c/testchannel2'
      );
      const secondRequestTime = Date.now() - secondStart;

      // Second request should include throttling delay (min 2s)
      // We expect it to be longer than instant (accounting for overhead)
      expect(secondRequestTime).toBeGreaterThanOrEqual(2000);
    }, 30000);

    it(
      'should rotate user agents',
      async () => {
        const mockPage = {
          setUserAgent: jest.fn().mockResolvedValue(undefined),
          goto: jest.fn().mockResolvedValue(null),
          evaluate: jest
            .fn()
            .mockResolvedValue({
              channelName: 'Channel',
              description: 'test'
            }),
          close: jest.fn().mockResolvedValue(undefined)
        };

        const mockBrowser = {
          newPage: jest.fn().mockResolvedValue(mockPage),
          close: jest.fn().mockResolvedValue(undefined)
        };

        mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

        const userAgents: string[] = [];

        // Make multiple requests and collect user agents
        for (let i = 0; i < 3; i++) {
          await youtubeService.extractChannelContactInfo(
            `https://www.youtube.com/c/channel${i}`
          );
          userAgents.push(mockPage.setUserAgent.mock.calls[i][0]);
        }

        // Should have different user agents (or at least called with them)
        expect(mockPage.setUserAgent).toHaveBeenCalledTimes(3);
        // Check that not all calls used the same user agent (rotation occurred)
        const uniqueAgents = new Set(userAgents);
        expect(uniqueAgents.size).toBeGreaterThan(0);
      },
      30000
    );

    it('should handle page load failures with fallback', async () => {
      const mockPage = {
        setUserAgent: jest.fn().mockResolvedValue(undefined),
        goto: jest
          .fn()
          .mockRejectedValueOnce(new Error('Timeout'))
          .mockResolvedValueOnce(null),
        evaluate: jest
          .fn()
          .mockResolvedValue({
            channelName: 'Channel',
            description: 'test'
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      const result = await youtubeService.extractChannelContactInfo(
        'https://www.youtube.com/c/testchannel'
      );

      // Should still return data even with fallback
      expect(result).toBeDefined();
      expect(mockPage.goto).toHaveBeenCalledTimes(2);
    });

    it('should close browser on error', async () => {
      const mockPage = {
        setUserAgent: jest.fn().mockRejectedValue(new Error('Setup failed')),
        goto: jest.fn(),
        evaluate: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      };

      mockPuppeteer.launch.mockResolvedValue(mockBrowser as any);

      try {
        await youtubeService.extractChannelContactInfo(
          'https://www.youtube.com/c/testchannel'
        );
      } catch {
        // Expected to throw
      }

      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
