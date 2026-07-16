import type { VideoMetadataResult } from "@yds/shared/types";
import { SUPPORTED_URL_PATTERNS } from "@yds/shared/constants";
import { getVideoInfo } from "./youtube.service.js";
import { ApifyService } from "./apify.service.js";
import { MetadataCache } from "./cache.service.js";
import type { Redis } from "ioredis";
import { logger } from "../config/logger.js";

export class MetadataServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "MetadataServiceError";
  }
}

export class MetadataService {
  constructor(
    private readonly apifyService: ApifyService | null,
    private readonly cache: MetadataCache,
  ) {}

  isValidYoutubeUrl(url: string): boolean {
    return SUPPORTED_URL_PATTERNS.some((pattern) => pattern.test(url));
  }

  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
      /(?:youtube\.com\/embed\/)([\w-]{11})/,
      /(?:youtube\.com\/shorts\/)([\w-]{11})/,
      /(?:youtube\.com\/live\/)([\w-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private isYtDlpErrorRetryable(error: Error): boolean {
    const msg = error.message.toLowerCase();
    const retryablePatterns = [
      "sign in",
      "confirm you're not a bot",
      "http error 429",
      "http error 5",
      "video unavailable",
      "age restricted",
      "cookie",
      "parse",
      "extractor",
      "network error",
      "connection refused",
      "timed out",
      "eof",
    ];

    return retryablePatterns.some((pattern) => msg.includes(pattern));
  }

  async getVideoMetadata(url: string): Promise<VideoMetadataResult> {
    if (!this.isValidYoutubeUrl(url)) {
      throw new MetadataServiceError("Invalid YouTube URL", "INVALID_URL");
    }

    const videoId = this.extractVideoId(url);

    if (videoId) {
      const cached = await this.cache.get(videoId);
      if (cached) {
        return cached;
      }
    }

    try {
      const data = await getVideoInfo(url);
      logger.info({ videoId: data.id, title: data.title }, "yt-dlp metadata success");

      const result: VideoMetadataResult = { data, provider: "yt-dlp" };

      if (videoId) {
        await this.cache.set(videoId, result);
      }

      return result;
    } catch (ytError) {
      logger.warn({ err: ytError instanceof Error ? ytError.message : String(ytError), url }, "yt-dlp failed");

      if (!this.apifyService) {
        logger.error("Apify fallback not available (no token configured)");
        throw new MetadataServiceError(
          "Unable to fetch metadata.",
          "BOTH_PROVIDERS_FAILED",
        );
      }

      const ytErrorMessage = ytError instanceof Error ? ytError.message : String(ytError);
      if (!this.isYtDlpErrorRetryable(ytError instanceof Error ? ytError : new Error(ytErrorMessage))) {
        logger.warn({ err: ytErrorMessage }, "yt-dlp error is non-retryable, skipping Apify");
        throw new MetadataServiceError(
          "Unable to fetch metadata.",
          "BOTH_PROVIDERS_FAILED",
        );
      }

      logger.info("Falling back to Apify");

      try {
        const data = await this.apifyService.getVideoMetadata(url);
        logger.info({ videoId: data.id, title: data.title }, "Apify metadata success");

        const result: VideoMetadataResult = { data, provider: "apify" };

        if (videoId) {
          await this.cache.set(videoId, result);
        }

        return result;
      } catch (apifyError) {
        logger.error(
          {
            err: apifyError instanceof Error ? apifyError.message : String(apifyError),
            url,
          },
          "Both providers failed",
        );

        throw new MetadataServiceError(
          "Unable to fetch metadata.",
          "BOTH_PROVIDERS_FAILED",
        );
      }
    }
  }
}

export function createMetadataService(getRedis: () => Redis | null, apifyToken?: string, apifyActorId?: string): MetadataService {
  let apifyService: ApifyService | null = null;

  if (apifyToken) {
    try {
      apifyService = new ApifyService(apifyToken, apifyActorId);
    } catch (error) {
      logger.warn({ err: error }, "Failed to initialize Apify service");
    }
  } else {
    logger.info("Apify not configured, metadata will use yt-dlp only");
  }

  const ttl = 86400;
  const cache = new MetadataCache(getRedis, ttl);

  return new MetadataService(apifyService, cache);
}
