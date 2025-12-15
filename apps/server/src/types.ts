export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  timestamp: Date;
}

export interface YoutubeContactInfo {
  emails: string[];
  contactNotes: string[];
}

export interface YoutubeChannelData {
  channelId: string;
  channelName: string;
  contactInfo: YoutubeContactInfo;
}

export interface PublicDataAggregatorResult {
  news: NewsItem[];
  youtubeData: YoutubeChannelData[];
  timestamp: Date;
}

export interface ServiceError {
  service: string;
  error: string;
  details?: string;
}
