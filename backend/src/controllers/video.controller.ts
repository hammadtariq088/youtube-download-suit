import type { Request, Response, NextFunction } from "express";
import { videoInfoQueue, downloadQueue, videoInfoQueueEvents } from "../queue/producer";
import { logger } from "../config/logger";
import { db } from "../config/db";
import { downloads, jobs } from "../db/schema";
import { AppError } from "../middleware/error-handler";
import { JobStatus } from "@yds/shared/types";
import type { DownloadFormat, VideoMetadataResult, VideoInfo } from "@yds/shared/types";
import { getRedis } from "../config/redis";
import { env } from "../config/env";

function extractVideoIdFromUrl(url: string): string | null {
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

async function waitForVideoInfo(url: string, timeoutMs = 120000): Promise<VideoMetadataResult> {
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
  return result as VideoMetadataResult;
}

export const videoController = {
  async info(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body as { url: string };
      const { data: videoInfo, provider } = await waitForVideoInfo(url);

      logger.info({ videoId: videoInfo.id, title: videoInfo.title, provider }, "Video info fetched");

      res.json({ success: true, provider, data: videoInfo });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error({ err: msg }, "Failed to fetch video info");

      if (msg.includes("timed out") || msg.includes("timeout")) {
        return next(new AppError(504, "Video info fetch timed out. Worker may be busy.", "WORKER_TIMEOUT"));
      }

      if (msg.includes("Unable to fetch metadata") || msg.includes("BOTH_PROVIDERS_FAILED")) {
        return next(new AppError(500, "Unable to fetch metadata.", "FETCH_FAILED"));
      }

      next(new AppError(502, "Failed to fetch video information. Worker may be offline.", "WORKER_OFFLINE"));
    }
  },

  async convert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, format } = req.body as {
        url: string;
        format: DownloadFormat;
      };

      const videoId = extractVideoIdFromUrl(url);
      if (videoId) {
        try {
          const redis = getRedis();
          const cached = await redis.get(`metadata:${videoId}`);
          if (cached) {
            const parsed = JSON.parse(cached) as { data: VideoInfo };
            const duration = parsed.data.duration;
            if (duration > env.MAX_DURATION_SECONDS) {
              return next(
                new AppError(
                  400,
                  `Video is too long (${Math.round(duration / 60)} min). Maximum allowed is ${Math.round(env.MAX_DURATION_SECONDS / 60)} min.`,
                  "VIDEO_TOO_LONG",
                ),
              );
            }
          }
        } catch {
          logger.warn({ videoId }, "Cache check failed, proceeding without duration validation");
        }
      }

      const [download] = await db
        .insert(downloads)
        .values({
          url,
          format,
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
        },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 60_000 },
          removeOnComplete: { age: 3600, count: 100 },
          removeOnFail: { age: 86400, count: 50 },
        },
      );

      logger.info({ downloadId: download.id, format }, "Download job created");

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
