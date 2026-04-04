import axios from 'axios';
import { ValidationError } from '../utils/errors';

export interface VideoInfo {
  videoType: 'vk' | 'rutube';
  externalUrl: string;
  embedCode: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export class ExternalVideoService {
  /**
   * Parses VK video URL and extracts video info
   * Supports formats:
   * - https://vk.com/video-123456_789012345
   * - https://vk.com/video123456_789012345
   * - https://m.vk.com/video-123456_789012345
   * - https://vkvideo.ru/video-123456_789012345
   */
  async parseVKVideo(url: string): Promise<VideoInfo> {
    // Extract video ID from URL
    // Support both vk.com and vkvideo.ru domains
    const vkVideoRegex = /(?:vk\.com|vkvideo\.ru)\/video(-?\d+_\d+)/;
    const match = url.match(vkVideoRegex);

    if (!match) {
      throw new ValidationError('Неверный формат ссылки на видео ВКонтакте');
    }

    const videoId = match[1];
    const externalUrl = `https://vk.com/video${videoId}`;
    
    // Generate embed code
    const embedCode = `<iframe src="https://vk.com/video_ext.php?oid=${videoId.split('_')[0]}&id=${videoId.split('_')[1]}&hd=2" width="853" height="480" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>`;

    // Try to fetch video metadata from VK API (optional, requires API key)
    let title: string | undefined;
    let thumbnailUrl: string | undefined;

    try {
      // For now, we'll use basic info
      // In production, you might want to use VK API to get more details
      title = `Видео ВКонтакте ${videoId}`;
    } catch (error) {
      console.error('Error fetching VK video metadata:', error);
    }

    return {
      videoType: 'vk',
      externalUrl,
      embedCode,
      thumbnailUrl,
      title,
    };
  }

  /**
   * Parses Rutube video URL and extracts video info
   * Supports formats:
   * - https://rutube.ru/video/abc123def456/
   * - https://rutube.ru/video/abc123def456
   */
  async parseRutubeVideo(url: string): Promise<VideoInfo> {
    // Extract video ID from URL
    const rutubeVideoRegex = /rutube\.ru\/video\/([a-zA-Z0-9]+)/;
    const match = url.match(rutubeVideoRegex);

    if (!match) {
      throw new ValidationError('Неверный формат ссылки на видео Rutube');
    }

    const videoId = match[1];
    const externalUrl = `https://rutube.ru/video/${videoId}/`;
    
    // Generate embed code
    const embedCode = `<iframe width="720" height="405" src="https://rutube.ru/play/embed/${videoId}" frameBorder="0" allow="clipboard-write; autoplay" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;

    // Try to fetch video metadata from Rutube API
    let title: string | undefined;
    let description: string | undefined;
    let thumbnailUrl: string | undefined;

    try {
      const response = await axios.get(`https://rutube.ru/api/video/${videoId}/`, {
        timeout: 5000,
      });

      if (response.data) {
        title = response.data.title;
        description = response.data.description;
        thumbnailUrl = response.data.thumbnail_url;
      }
    } catch (error) {
      console.error('Error fetching Rutube video metadata:', error);
      title = `Видео Rutube ${videoId}`;
    }

    return {
      videoType: 'rutube',
      externalUrl,
      embedCode,
      thumbnailUrl,
      title,
      description,
    };
  }

  /**
   * Detects video platform and parses the URL
   */
  async parseVideoUrl(url: string): Promise<VideoInfo> {
    // Normalize URL
    const normalizedUrl = url.trim();

    // Detect platform
    if (normalizedUrl.includes('vk.com') || normalizedUrl.includes('vkvideo.ru')) {
      return this.parseVKVideo(normalizedUrl);
    } else if (normalizedUrl.includes('rutube.ru')) {
      return this.parseRutubeVideo(normalizedUrl);
    } else {
      throw new ValidationError('Поддерживаются только видео с ВКонтакте (vk.com, vkvideo.ru) и Rutube');
    }
  }
}

export const externalVideoService = new ExternalVideoService();
