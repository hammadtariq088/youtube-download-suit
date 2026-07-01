import type { Redis } from "ioredis";
import type { VideoMetadataResult } from "@yds/shared/types";
import { logger } from "../config/logger";

export class MetadataCache {
  private readonly prefix = "metadata:";
  private readonly ttlSeconds: number;

  constructor(
    private getRedis: () => Redis | null,
    ttlSeconds: number,
  ) {
    this.ttlSeconds = ttlSeconds;
  }

  buildKey(videoId: string): string {
    return `${this.prefix}${videoId}`;
  }

  async get(videoId: string): Promise<VideoMetadataResult | null> {
    try {
      const redis = this.getRedis();
      if (!redis) return null;

      const raw = await redis.get(this.buildKey(videoId));
      if (!raw) return null;

      const parsed = JSON.parse(raw) as VideoMetadataResult;
      logger.debug({ videoId }, "Cache hit for metadata");
      return parsed;
    } catch (error) {
      logger.warn({ err: error, videoId }, "Cache read failed");
      return null;
    }
  }

  async set(videoId: string, data: VideoMetadataResult): Promise<void> {
    try {
      const redis = this.getRedis();
      if (!redis) return;

      await redis.setex(
        this.buildKey(videoId),
        this.ttlSeconds,
        JSON.stringify(data),
      );
      logger.debug({ videoId, ttl: this.ttlSeconds }, "Metadata cached");
    } catch (error) {
      logger.warn({ err: error, videoId }, "Cache write failed");
    }
  }

  async invalidate(videoId: string): Promise<void> {
    try {
      const redis = this.getRedis();
      if (!redis) return;

      await redis.del(this.buildKey(videoId));
      logger.debug({ videoId }, "Cache invalidated");
    } catch (error) {
      logger.warn({ err: error, videoId }, "Cache invalidation failed");
    }
  }
}
