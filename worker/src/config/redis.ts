import { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    redis.on("error", (err) => {
      logger.error({ err: (err as Error).message }, "Redis connection error");
    });
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
