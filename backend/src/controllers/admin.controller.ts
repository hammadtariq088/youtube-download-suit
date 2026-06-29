import type { Request, Response, NextFunction } from "express";
import { eq, desc, sql, count, gte, asc } from "drizzle-orm";
import { db } from "../config/db";
import { downloads, jobs, workerLogs, analytics, settings, cookies } from "../db/schema";
import { getRedis } from "../config/redis";
import { queues } from "../queue/producer";
import { logger } from "../config/logger";
import { AppError } from "../middleware/error-handler";
import { JobStatus } from "@yds/shared/types";

export const adminController = {
  async analytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const [totalDownloads] = await db
        .select({ count: count() })
        .from(downloads);

      const [successfulDownloads] = await db
        .select({ count: count() })
        .from(downloads)
        .where(eq(downloads.status, JobStatus.COMPLETED));

      const [failedDownloads] = await db
        .select({ count: count() })
        .from(downloads)
        .where(eq(downloads.status, JobStatus.FAILED));

      const recentAnalytics = await db
        .select()
        .from(analytics)
        .where(gte(analytics.date, thirtyDaysAgo))
        .orderBy(asc(analytics.date));

      const formatCounts = await db
        .select({
          format: downloads.format,
          count: count(),
        })
        .from(downloads)
        .groupBy(downloads.format)
        .orderBy(desc(sql`count`))
        .limit(10);

      const qualityCounts = await db
        .select({
          quality: downloads.quality,
          count: count(),
        })
        .from(downloads)
        .groupBy(downloads.quality)
        .orderBy(desc(sql`count`))
        .limit(10);

      res.json({
        success: true,
        data: {
          overview: {
            totalDownloads: Number(totalDownloads.count),
            successfulDownloads: Number(successfulDownloads.count),
            failedDownloads: Number(failedDownloads.count),
            successRate:
              Number(totalDownloads.count) > 0
                ? ((Number(successfulDownloads.count) / Number(totalDownloads.count)) * 100).toFixed(2)
                : "0",
          },
          dailyAnalytics: recentAnalytics,
          topFormats: formatCounts,
          topQualities: qualityCounts,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to fetch analytics");
      next(new AppError(500, "Failed to fetch analytics"));
    }
  },

  async downloads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const [totalResult] = await db.select({ count: count() }).from(downloads);
      const total = Number(totalResult.count);

      const items = await db
        .select()
        .from(downloads)
        .orderBy(desc(downloads.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to list downloads");
      next(new AppError(500, "Failed to list downloads"));
    }
  },

  async jobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const [totalResult] = await db.select({ count: count() }).from(jobs);
      const total = Number(totalResult.count);

      const items = await db
        .select()
        .from(jobs)
        .orderBy(desc(jobs.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to list jobs");
      next(new AppError(500, "Failed to list jobs"));
    }
  },

  async errors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const [totalResult] = await db
        .select({ count: count() })
        .from(workerLogs)
        .where(eq(workerLogs.level, "error"));

      const total = Number(totalResult.count);

      const items = await db
        .select()
        .from(workerLogs)
        .where(eq(workerLogs.level, "error"))
        .orderBy(desc(workerLogs.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to list errors");
      next(new AppError(500, "Failed to list errors"));
    }
  },

  async workerStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const redis = getRedis();
      const workerKeys = await redis.keys("bull:*:workers");
      const [ytdlpVersion] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "ytdlp_version"))
        .limit(1);

      res.json({
        success: true,
        data: {
          workerCount: workerKeys.length,
          ytdlpVersion: ytdlpVersion?.value || "unknown",
          redis: "connected",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to get worker status");
      next(new AppError(500, "Failed to get worker status"));
    }
  },

  async queue(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queueStatuses: Record<string, unknown> = {};
      for (const [name, queue] of Object.entries(queues)) {
        const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
          queue.isPaused(),
        ]);
        queueStatuses[name] = { waiting, active, completed, failed, delayed, paused };
      }

      res.json({ success: true, data: queueStatuses });
    } catch (error) {
      logger.error({ err: error }, "Failed to get queue status");
      next(new AppError(500, "Failed to get queue status"));
    }
  },

  async storage(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [completedDownloads] = await db
        .select({
          count: count(),
          totalSize: sql`COALESCE(SUM(file_size), 0)`,
        })
        .from(downloads)
        .where(eq(downloads.status, JobStatus.COMPLETED));

      res.json({
        success: true,
        data: {
          totalFiles: Number(completedDownloads.count),
          totalSizeBytes: Number(completedDownloads.totalSize),
          totalSizeGB: (Number(completedDownloads.totalSize) / 1_073_741_824).toFixed(2),
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to get storage info");
      next(new AppError(500, "Failed to get storage info"));
    }
  },

  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

      if (!job) {
        return next(new AppError(404, "Job not found", "JOB_NOT_FOUND"));
      }

      await db
        .update(jobs)
        .set({ status: JobStatus.PENDING, attempts: 0, lastError: null, updatedAt: new Date() })
        .where(eq(jobs.id, id));

      if (job.downloadId) {
        await db
          .update(downloads)
          .set({ status: JobStatus.PENDING, progress: 0, errorMessage: null, updatedAt: new Date() })
          .where(eq(downloads.id, job.downloadId));
      }

      const queue = queues[job.queue as keyof typeof queues];
      if (queue && job.downloadId) {
        await queue.add(job.queue, { downloadId: job.downloadId }, { attempts: 5 });
      }

      logger.info({ jobId: id }, "Job queued for retry");
      res.json({ success: true, message: "Job queued for retry" });
    } catch (error) {
      logger.error({ err: error }, "Failed to retry job");
      next(new AppError(500, "Failed to retry job"));
    }
  },

  async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

      if (!job) {
        return next(new AppError(404, "Job not found", "JOB_NOT_FOUND"));
      }

      await db.delete(jobs).where(eq(jobs.id, id));

      if (job.downloadId) {
        await db
          .update(downloads)
          .set({ status: JobStatus.CANCELLED, updatedAt: new Date() })
          .where(eq(downloads.id, job.downloadId));
      }

      logger.info({ jobId: id }, "Job deleted");
      res.json({ success: true, message: "Job deleted" });
    } catch (error) {
      logger.error({ err: error }, "Failed to delete job");
      next(new AppError(500, "Failed to delete job"));
    }
  },

  async clearQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.params;
      const queue = queues[name as keyof typeof queues];

      if (!queue) {
        return next(new AppError(404, "Queue not found", "QUEUE_NOT_FOUND"));
      }

      await queue.drain();
      logger.info({ queue: name }, "Queue cleared");
      res.json({ success: true, message: `Queue "${name}" cleared` });
    } catch (error) {
      logger.error({ err: error }, "Failed to clear queue");
      next(new AppError(500, "Failed to clear queue"));
    }
  },

  async updateYtdlp(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queue = queues.cleanup;
      await queue.add("update-ytdlp", { action: "update-ytdlp" });
      logger.info("yt-dlp update triggered");
      res.json({ success: true, message: "yt-dlp update triggered" });
    } catch (error) {
      logger.error({ err: error }, "Failed to trigger yt-dlp update");
      next(new AppError(500, "Failed to trigger yt-dlp update"));
    }
  },

  async listCookies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allCookies = await db.select().from(cookies).orderBy(desc(cookies.createdAt));
      res.json({ success: true, data: allCookies });
    } catch (error) {
      logger.error({ err: error }, "Failed to list cookies");
      next(new AppError(500, "Failed to list cookies"));
    }
  },

  async uploadCookie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, profile, content } = req.body as { name: string; profile: string; content: string };

      if (!name || !content) {
        return next(new AppError(400, "Name and content are required", "VALIDATION_ERROR"));
      }

      await db.insert(cookies).values({
        name,
        profile: profile || "default",
        content,
        isActive: false,
      });

      logger.info({ name }, "Cookie uploaded");
      res.status(201).json({ success: true, message: "Cookie uploaded" });
    } catch (error) {
      logger.error({ err: error }, "Failed to upload cookie");
      next(new AppError(500, "Failed to upload cookie"));
    }
  },

  async deleteCookie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await db.delete(cookies).where(eq(cookies.id, id));
      logger.info({ cookieId: id }, "Cookie deleted");
      res.json({ success: true, message: "Cookie deleted" });
    } catch (error) {
      logger.error({ err: error }, "Failed to delete cookie");
      next(new AppError(500, "Failed to delete cookie"));
    }
  },
};
