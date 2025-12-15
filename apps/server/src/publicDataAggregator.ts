import { newsService } from './services/newsService';
import { youtubeService } from './services/youtubeService';
import {
  PublicDataAggregatorResult,
  NewsItem,
  YoutubeChannelData,
  ServiceError
} from './types';

export class PublicDataAggregator {
  /**
   * Aggregates public data (news and YouTube channel info) based on a user query
   * @param userQuery - The query to search for relevant data
   * @returns Combined news and YouTube data relevant to the query
   */
  async aggregatePublicData(
    userQuery: string
  ): Promise<{
    data: PublicDataAggregatorResult;
    errors: ServiceError[];
  }> {
    const errors: ServiceError[] = [];
    const newsItems: NewsItem[] = [];
    const youtubeData: YoutubeChannelData[] = [];

    // Fetch news data
    try {
      const news = await newsService.fetchTodayHeadlines();
      const relevantNews = this.filterByQuery(news, userQuery);
      newsItems.push(...relevantNews);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        service: 'newsService',
        error: 'Failed to fetch news',
        details: errorMsg
      });
    }

    // For YouTube service, we would need actual channel URLs from the query
    // In this implementation, we demonstrate the capability to fetch channel data
    // This would be extended based on actual query parsing requirements
    const youtubeChannelUrls = this.extractYoutubeChannelUrls(userQuery);

    for (const channelUrl of youtubeChannelUrls) {
      try {
        const channelData =
          await youtubeService.extractChannelContactInfo(channelUrl);
        if (channelData) {
          youtubeData.push(channelData);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          service: 'youtubeService',
          error: `Failed to extract data from ${channelUrl}`,
          details: errorMsg
        });
      }
    }

    return {
      data: {
        news: newsItems,
        youtubeData,
        timestamp: new Date()
      },
      errors
    };
  }

  private filterByQuery<T extends { title?: string; summary?: string }>(
    items: T[],
    query: string
  ): T[] {
    const queryTerms = query
      .toLowerCase()
      .split(' ')
      .filter((term) => term.length > 0);

    return items.filter((item) => {
      const searchText = (
        (item.title || '') +
        ' ' +
        (item.summary || '')
      ).toLowerCase();
      return queryTerms.some((term) => searchText.includes(term));
    });
  }

  private extractYoutubeChannelUrls(query: string): string[] {
    // Pattern to extract YouTube channel URLs from query
    // Supports formats: /c/, /channel/, /user/, /@
    const youtubeUrlPattern =
      /https?:\/\/(www\.)?youtube\.com\/(@[^\s/]+|(c|channel|user)\/[^\s/]+)/gi;
    const matches = query.match(youtubeUrlPattern) || [];
    return matches;
  }
}

export const publicDataAggregator = new PublicDataAggregator();
