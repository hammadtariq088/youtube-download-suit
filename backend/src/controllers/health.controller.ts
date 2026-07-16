import type { Request, Response, NextFunction } from "express";
import { getRedis } from "../config/redis.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import { sql } from "../config/db.js";
import { videoInfoQueue, downloadQueue, cleanupQueue } from "../queue/producer.js";

async function checkDb(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    const redis = getRedis();
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

async function getQueueStatus() {
  const queues: Record<string, unknown> = { videoInfo: videoInfoQueue, download: downloadQueue, cleanup: cleanupQueue };
  const statuses: Record<string, unknown> = {};
  for (const [name, queue] of Object.entries(queues)) {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        (queue as any).getWaitingCount(),
        (queue as any).getActiveCount(),
        (queue as any).getCompletedCount(),
        (queue as any).getFailedCount(),
        (queue as any).getDelayedCount(),
      ]);
      statuses[name] = { waiting, active, completed, failed, delayed };
    } catch (err) {
      statuses[name] = { error: String(err) };
    }
  }
  return statuses;
}

export const healthController = {
  async health(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    const [dbOk, redisOk] = await Promise.all([checkDb(), checkRedis()]);

    res.json({
      success: true,
      data: {
        status: dbOk && redisOk ? "healthy" : "degraded",
        database: dbOk ? "connected" : "disconnected",
        redis: redisOk ? "connected" : "disconnected",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  },

  async workerStatus(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    const redisOk = await checkRedis();
    if (!redisOk) {
      res.json({ success: false, error: "Redis unavailable" });
      return;
    }

    const redis = getRedis();
    const workers = await redis.keys("bull:*:workers");
    res.json({ success: true, data: { workers: workers.length, redis: "connected" } });
  },

  async version(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    res.json({
      success: true,
      data: {
        version: "1.0.0",
        nodeVersion: process.version,
        environment: env.NODE_ENV,
      },
    });
  },

  async queue(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const statuses = await getQueueStatus();
      res.json({ success: true, data: statuses });
    } catch (error) {
      logger.error({ err: error }, "Failed to get queue status");
      res.status(500).json({ success: false, error: "Failed to get queue status" });
    }
  },
};
