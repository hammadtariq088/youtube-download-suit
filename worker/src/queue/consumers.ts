import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { QUEUES } from "@yds/shared/constants";
import { JobStatus } from "@yds/shared/types";
import { getRedis } from "../config/redis.js";
import { db } from "../config/db.js";
import { logger } from "../config/logger.js";
import { downloads, jobs, settings } from "@yds/shared/db/schema";
import { downloadVideo, getVideoTitle, updateYtdlp } from "../services/youtube.service.js";
import { convertFile } from "../services/convert.service.js";
import { uploadFile } from "../services/upload.service.js";
import { cleanupSingleFile } from "../services/cleanup.service.js";
import { createMetadataService } from "../services/metadata.service.js";
import { env } from "../config/env.js";
import type { VideoInfo } from "@yds/shared/types";
import { sanitizeFilename } from "../utils/filename.js";

const metadataService = createMetadataService(
  getRedis,
  env.APIFY_TOKEN,
  env.APIFY_ACTOR_ID || undefined,
);

function createWorker<T>(queueName: string, handler: (job: any) => Promise<T>): Worker {
  const worker = new Worker(queueName, handler, {
    connection: getRedis(),
    concurrency: env.WORKER_CONCURRENCY,
    lockDuration: 180_000,
    stalledInterval: 60_000,
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, queue: queueName }, "Job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, queue: queueName, err: err.message }, "Job failed");
  });

  worker.on("error", (err) => {
    logger.error({ err, queue: queueName }, "Worker error");
  });

  return worker;
}

export const videoInfoWorker = createWorker(QUEUES.VIDEO_INFO, async (job) => {
  const { url } = job.data as { url: string };
  logger.info({ jobId: job.id, url }, "Processing video info request");

  const result = await metadataService.getVideoMetadata(url);

  job.updateProgress(100);

  return result;
});

async function getVideoMetadataFromCache(videoId: string): Promise<{
  title: string;
  description: string;
  duration: number;
  uploader: string;
  thumbnail: string;
  provider: string;
} | null> {
  try {
    const redis = getRedis();
    const cached = await redis.get(`metadata:${videoId}`);
    if (cached) {
      const parsed = JSON.parse(cached) as { data: VideoInfo; provider?: string };
      return {
        title: parsed.data.title,
        description: parsed.data.description,
        duration: parsed.data.duration,
        uploader: parsed.data.uploader,
        thumbnail: parsed.data.thumbnail,
        provider: parsed.provider || "yt-dlp",
      };
    }
  } catch (error) {
    logger.warn({ err: error, videoId }, "Cache read failed");
  }
  return null;
}

export const downloadWorker = createWorker(QUEUES.DOWNLOAD, async (job) => {
  const { downloadId, url, format } = job.data as {
    downloadId: string;
    url: string;
    format: string;
  };

  logger.info({ jobId: job.id, downloadId, url, format }, "Processing download");

  await db.update(jobs).set({ status: JobStatus.PROCESSING, updatedAt: new Date() }).where(eq(jobs.id, downloadId));
  await db.update(downloads).set({ status: JobStatus.PROCESSING, progress: 10, updatedAt: new Date() }).where(eq(downloads.id, downloadId));

  const videoId = metadataService.extractVideoId(url) || "";

  let originalTitle = "";
  let description = "";
  let channelName = "";
  let thumbnail = "";
  let cachedDuration: number | null = null;
  let provider: string | null = null;

  if (videoId) {
    const cached = await getVideoMetadataFromCache(videoId);
    if (cached) {
      originalTitle = cached.title;
      description = cached.description;
      channelName = cached.uploader;
      thumbnail = cached.thumbnail;
      cachedDuration = cached.duration;
      provider = cached.provider;

      if (cached.duration > env.MAX_DURATION_SECONDS) {
        const errorMsg = `This video is ${Math.round(cached.duration / 60)} minutes long. Maximum allowed duration is ${Math.round(env.MAX_DURATION_SECONDS / 60)} minutes.`;
        await db
          .update(downloads)
          .set({
            status: JobStatus.FAILED,
            errorMessage: errorMsg,
            updatedAt: new Date(),
          })
          .where(eq(downloads.id, downloadId));
        await db
          .update(jobs)
          .set({ status: JobStatus.FAILED, lastError: errorMsg, updatedAt: new Date() })
          .where(eq(jobs.id, downloadId));
        throw new Error(errorMsg);
      }

      logger.info({ videoId, duration: cached.duration }, "Pre-download validation passed");
    } else {
      try {
        originalTitle = await getVideoTitle(url);
        logger.info({ videoId, title: originalTitle }, "Fetched video title as fallback");
      } catch {
        logger.warn({ videoId }, "Could not fetch video title, will use filename");
      }
    }
  }

  const startTime = Date.now();

  try {
    const { filePath } = await downloadVideo(url, format);

    const effectiveTitle = originalTitle || videoId || "video";
    const ext = format === "mp3" ? "mp3" : "mp4";
    const fileName = `${sanitizeFilename(effectiveTitle)}.${ext}`;
    const mimeType = ext === "mp4" ? "video/mp4" : "audio/mpeg";

    await db
      .update(downloads)
      .set({
        progress: 50,
        title: effectiveTitle,
        fileName,
        fileExtension: ext,
        mimeType,
        youtubeVideoId: videoId || null,
        description: description || null,
        channelName: channelName || null,
        thumbnail: thumbnail || null,
        duration: cachedDuration,
        provider: provider,
        updatedAt: new Date(),
      })
      .where(eq(downloads.id, downloadId));

    const { outputPath } = await convertFile(filePath, format);

    await db.update(downloads).set({ progress: 80, updatedAt: new Date() }).where(eq(downloads.id, downloadId));

    const { key, size, fileName: uploadedFileName } = await uploadFile(
      outputPath,
      videoId || "unknown",
      effectiveTitle,
      format,
    );

    const processingTime = Date.now() - startTime;

    await db
      .update(downloads)
      .set({
        status: JobStatus.COMPLETED,
        progress: 100,
        r2Key: key,
        fileSize: size,
        fileName: uploadedFileName,
        processingTimeMs: processingTime,
        updatedAt: new Date(),
      })
      .where(eq(downloads.id, downloadId));

    await db
      .update(jobs)
      .set({ status: JobStatus.COMPLETED, updatedAt: new Date() })
      .where(eq(jobs.id, downloadId));

    await cleanupSingleFile(filePath);
    if (outputPath !== filePath) {
      await cleanupSingleFile(outputPath);
    }

    logger.info({ downloadId, key, size, fileName: uploadedFileName, processingTime }, "Download job completed successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const processingTime = Date.now() - startTime;

    await db
      .update(downloads)
      .set({
        status: JobStatus.FAILED,
        errorMessage: message,
        processingTimeMs: processingTime,
        updatedAt: new Date(),
      })
      .where(eq(downloads.id, downloadId));

    await db
      .update(jobs)
      .set({ status: JobStatus.FAILED, lastError: message, updatedAt: new Date() })
      .where(eq(jobs.id, downloadId));

    logger.error({ downloadId, err: message, processingTime }, "Download job failed");
    throw error;
  }
});

export const cleanupWorker = createWorker(QUEUES.CLEANUP, async (job) => {
  const { action } = job.data as { action?: string };

  if (action === "update-ytdlp") {
    logger.info("Updating yt-dlp");
    const result = updateYtdlp();
    await db
      .insert(settings)
      .values({ key: "ytdlp_version", value: result.version, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: result.version, updatedAt: new Date() } });

    logger.info({ version: result.version }, "yt-dlp version stored");
  }
});

export function getWorkers(): Worker[] {
  return [videoInfoWorker, downloadWorker, cleanupWorker];
}

export async function closeWorkers(): Promise<void> {
  await Promise.all(getWorkers().map((w) => w.close()));
}
