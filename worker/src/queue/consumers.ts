import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { QUEUES } from "@yds/shared/constants";
import { JobStatus } from "@yds/shared/types";
import { getRedis } from "../config/redis";
import { db } from "../config/db";
import { logger } from "../config/logger";
import { downloads, jobs, settings } from "../../../backend/src/db/schema";
import { getVideoInfo, downloadVideo, updateYtdlp } from "../services/youtube.service";
import { convertFile } from "../services/convert.service";
import { uploadFile } from "../services/upload.service";
import { cleanupSingleFile } from "../services/cleanup.service";
import { env } from "../config/env";

function createWorker(queueName: string, handler: (job: any) => Promise<void>): Worker {
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

  const info = await getVideoInfo(url);

  await db.insert(downloads).values({
    url,
    title: info.title,
    format: "mp4",
    quality: "best",
    status: JobStatus.COMPLETED,
  });

  job.updateProgress(100);

  return info;
});

export const downloadWorker = createWorker(QUEUES.DOWNLOAD, async (job) => {
  const { downloadId, url, format, quality } = job.data as {
    downloadId: string;
    url: string;
    format: string;
    quality: string;
  };

  logger.info({ jobId: job.id, downloadId, url, format, quality }, "Processing download");

  await db.update(jobs).set({ status: JobStatus.PROCESSING, updatedAt: new Date() }).where(eq(jobs.id, downloadId));
  await db.update(downloads).set({ status: JobStatus.PROCESSING, progress: 10, updatedAt: new Date() }).where(eq(downloads.id, downloadId));

  const startTime = Date.now();

  try {
    const { filePath, title } = await downloadVideo(url, format as any, quality as any);

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

export const audioWorker = createWorker(QUEUES.AUDIO, async (job) => {
  const { downloadId, url, format } = job.data as {
    downloadId: string;
    url: string;
    format: string;
  };

  logger.info({ jobId: job.id, downloadId, url, format }, "Processing audio download");

  const { filePath, title } = await downloadVideo(url, format as any, "best" as any);
  const { outputPath } = await convertFile(filePath, format);
  const { key, size } = await uploadFile(outputPath);

  await db
    .update(downloads)
    .set({
      status: JobStatus.COMPLETED,
      progress: 100,
      title,
      r2Key: key,
      fileSize: size,
      updatedAt: new Date(),
    })
    .where(eq(downloads.id, downloadId));

  await cleanupSingleFile(filePath);
  if (outputPath !== filePath) {
    await cleanupSingleFile(outputPath);
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

export const retryWorker = createWorker(QUEUES.RETRY, async (job) => {
  const { downloadId } = job.data as { downloadId: string };

  logger.info({ jobId: job.id, downloadId }, "Processing retry");

  const [existingJob] = await db.select().from(jobs).where(eq(jobs.id, downloadId)).limit(1);
  if (existingJob) {
    const queueName = existingJob.queue || QUEUES.DOWNLOAD;
    const { queues } = await import("../../../backend/src/queue/producer");
    const queue = queues[queueName as keyof typeof queues];
    if (queue) {
      await queue.add(queueName, job.data, { attempts: 5 });
    }
  }
});

export function getWorkers(): Worker[] {
  return [videoInfoWorker, downloadWorker, audioWorker, cleanupWorker, retryWorker];
}

export async function closeWorkers(): Promise<void> {
  await Promise.all(getWorkers().map((w) => w.close()));
}
