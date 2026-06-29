import type { Request, Response, NextFunction } from "express";
import { videoInfoQueue, downloadQueue, videoInfoQueueEvents } from "../queue/producer";
import { logger } from "../config/logger";
import { db } from "../config/db";
import { downloads, jobs } from "../db/schema";
import { AppError } from "../middleware/error-handler";
import { JobStatus } from "@yds/shared/types";
import type { DownloadFormat, DownloadQuality, VideoInfo } from "@yds/shared/types";

async function waitForVideoInfo(url: string, timeoutMs = 30000): Promise<VideoInfo> {
  const job = await videoInfoQueue.add(
    "video-info",
    { url },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  const result = await job.waitUntilFinished(videoInfoQueueEvents, timeoutMs);
  return result as VideoInfo;
}

export const videoController = {
  async info(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body as { url: string };
      const videoInfo = await waitForVideoInfo(url);

      logger.info({ videoId: videoInfo.id, title: videoInfo.title }, "Video info fetched");

      res.json({ success: true, data: videoInfo });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error({ err: msg }, "Failed to fetch video info");

      if (msg.includes("timed out") || msg.includes("timeout")) {
        return next(new AppError(504, "Video info fetch timed out. Worker may be busy.", "WORKER_TIMEOUT"));
      }

      next(new AppError(502, "Failed to fetch video information. Worker may be offline.", "WORKER_OFFLINE"));
    }
  },

  async convert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, format, quality } = req.body as {
        url: string;
        format: DownloadFormat;
        quality: DownloadQuality;
      };

      const [download] = await db
        .insert(downloads)
        .values({
          url,
          format,
          quality,
          status: JobStatus.PENDING,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        })
        .returning();

      await db.insert(jobs).values({
        downloadId: download.id,
        queue: "download",
        status: JobStatus.PENDING,
      });

      await downloadQueue.add(
        "download",
        {
          downloadId: download.id,
          url,
          format,
          quality,
        },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 60_000 },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );

      logger.info({ downloadId: download.id, format, quality }, "Download job created");

      res.status(201).json({
        success: true,
        data: {
          id: download.id,
          status: download.status,
          pollUrl: `/api/download/${download.id}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to create download job");
      next(new AppError(500, "Failed to create download job", "INTERNAL_ERROR"));
    }
  },
};
