import puppeteer, { Browser } from 'puppeteer';
import { YoutubeChannelData, YoutubeContactInfo } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

const MIN_REQUEST_DELAY_MS = 2000;
const MAX_REQUEST_DELAY_MS = 5000;

export class YoutubeService {
  private lastRequestTime: number = 0;
  private userAgentIndex: number = 0;

  private getRandomDelay(): number {
    return (
      Math.floor(
        Math.random() * (MAX_REQUEST_DELAY_MS - MIN_REQUEST_DELAY_MS)
      ) + MIN_REQUEST_DELAY_MS
    );
  }

  private getNextUserAgent(): string {
    const agent = USER_AGENTS[this.userAgentIndex];
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
    return agent;
  }

  private async applyThrottling(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const requiredDelay = this.getRandomDelay();

    if (timeSinceLastRequest < requiredDelay) {
      const delayNeeded = requiredDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    this.lastRequestTime = Date.now();
  }

  async extractChannelContactInfo(
    channelUrl: string
  ): Promise<YoutubeChannelData | null> {
    let browser: Browser | null = null;

    try {
      await this.applyThrottling();

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      const userAgent = this.getNextUserAgent();
      await page.setUserAgent(userAgent);

      const aboutUrl = `${channelUrl.replace(/\/$/, '')}/about`;

      try {
        await page.goto(aboutUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch {
        await page.goto(aboutUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }

      const channelData = await page.evaluate(() => {
        const pageText = document.body.innerText;
        const titleElem = document.querySelector('h1.style-scope');
        const descElem = document.querySelector(
          'yt-formatted-string.content'
        );

        return {
          channelName: titleElem?.textContent || 'Unknown Channel',
          description: descElem?.textContent || pageText
        };
      });

      const contactInfo = this.extractContactInfo(
        channelData.description || ''
      );

      const channelId = this.extractChannelId(channelUrl);

      await page.close();
      await browser.close();

      return {
        channelId,
        channelName: channelData.channelName,
        contactInfo
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to extract YouTube channel contact info: ${errorMessage}`
      );
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  private extractChannelId(channelUrl: string): string {
    const match = channelUrl.match(/(?:youtube\.com\/(?:c|channel|user)\/|@)([^/?]+)/);
    return match ? match[1] : 'unknown';
  }

  private extractContactInfo(text: string): YoutubeContactInfo {
    const emails: string[] = [];
    const contactNotes: string[] = [];

    const emailRegex =
      /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatches = text.match(emailRegex) || [];

    emails.push(...new Set(emailMatches));

    const contactKeywords = [
      'contact',
      'email',
      'business',
      'inquiry',
      'inquiries',
      'collaboration',
      'partnership',
      'reach out'
    ];
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (
        contactKeywords.some((keyword) =>
          lowerSentence.includes(keyword)
        )
      ) {
        const trimmed = sentence.trim();
        if (trimmed && trimmed.length > 10 && trimmed.length < 300) {
          contactNotes.push(trimmed);
        }
      }
    }

    return {
      emails: Array.from(new Set(emails)),
      contactNotes: Array.from(new Set(contactNotes)).slice(0, 5)
    };
  }
}

export const youtubeService = new YoutubeService();
