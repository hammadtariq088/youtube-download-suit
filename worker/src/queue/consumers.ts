import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { QUEUES } from "@yds/shared/constants";
import { JobStatus } from "@yds/shared/types";
import { getRedis } from "../config/redis";
import { db } from "../config/db";
import { logger } from "../config/logger";
import { downloads, jobs, settings } from "../../../backend/src/db/schema";
import { downloadVideo, updateYtdlp } from "../services/youtube.service";
import { convertFile } from "../services/convert.service";
import { uploadFile } from "../services/upload.service";
import { cleanupSingleFile } from "../services/cleanup.service";
import { createMetadataService } from "../services/metadata.service";
import { env } from "../config/env";
import type { VideoInfo } from "@yds/shared/types";

const metadataService = createMetadataService(
  getRedis,
  env.APIFY_TOKEN,
  env.APIFY_ACTOR_ID || undefined,
);

function createWorker<T>(queueName: string, handler: (job: any) => Promise<T>): Worker {
  const worker = new Worker(queueName, handler, {
    connection: getRedis(),
    concurrency: env.WORKER_CONCURRENCY,
    lockDuration: 120_000,
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

export const downloadWorker = createWorker(QUEUES.DOWNLOAD, async (job) => {
  const { downloadId, url, format } = job.data as {
    downloadId: string;
    url: string;
    format: string;
  };

  logger.info({ jobId: job.id, downloadId, url, format }, "Processing download");

  await db.update(jobs).set({ status: JobStatus.PROCESSING, updatedAt: new Date() }).where(eq(jobs.id, downloadId));
  await db.update(downloads).set({ status: JobStatus.PROCESSING, progress: 10, updatedAt: new Date() }).where(eq(downloads.id, downloadId));

  const videoId = metadataService.extractVideoId(url);
  if (videoId) {
    try {
      const redis = getRedis();
      const cached = await redis.get(`metadata:${videoId}`);
      if (cached) {
        const parsed = JSON.parse(cached) as { data: VideoInfo };
        const duration = parsed.data.duration;
        if (duration > env.MAX_DURATION_SECONDS) {
          throw new Error(
            `Video is too long (${Math.round(duration / 60)} min). Maximum allowed is ${Math.round(env.MAX_DURATION_SECONDS / 60)} min.`,
          );
        }
        logger.info({ videoId, duration }, "Pre-download validation passed");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("too long")) {
        throw error;
      }
      logger.warn({ err: error, videoId }, "Pre-download cache check failed, proceeding anyway");
    }
  }

  const startTime = Date.now();

  try {
    const { filePath, title } = await downloadVideo(url, format);

    await db.update(downloads).set({ progress: 50, title, updatedAt: new Date() }).where(eq(downloads.id, downloadId));

    const { outputPath } = await convertFile(filePath, format);

    await db.update(downloads).set({ progress: 80, updatedAt: new Date() }).where(eq(downloads.id, downloadId));

    const { key, size } = await uploadFile(outputPath);

    const processingTime = Date.now() - startTime;

    await db
      .update(downloads)
      .set({
        status: JobStatus.COMPLETED,
        progress: 100,
        r2Key: key,
        fileSize: size,
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

    logger.info({ downloadId, key, size, processingTime }, "Download job completed successfully");
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
