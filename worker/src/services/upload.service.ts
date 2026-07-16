import { createReadStream, stat } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { r2Client, R2_CONFIG } from "../config/r2.js";
import { logger } from "../config/logger.js";
import { sanitizeFilename } from "../utils/filename.js";

const UPLOAD_TIMEOUT_MS = 300_000;
const PART_SIZE = 10 * 1024 * 1024;

export interface UploadResult {
  key: string;
  size: number;
  fileName: string;
}

export async function uploadFile(
  localPath: string,
  videoId: string,
  title: string,
  format: string,
): Promise<UploadResult> {
  const ext = format === "mp3" ? "mp3" : "mp4";
  const sanitized = sanitizeFilename(title);
  const fileName = `${sanitized}.${ext}`;
  const key = `downloads/${ext}/${videoId}-${sanitized}.${ext}`;

  logger.info({ localPath, key }, "Starting streaming upload to R2");

  const size = await new Promise<number>((resolve, reject) => {
    stat(localPath, (err, stats) => {
      if (err) reject(err);
      else resolve(stats.size);
    });
  });

  const contentType = ext === "mp4" ? "video/mp4" : "audio/mpeg";

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: createReadStream(localPath),
      ContentType: contentType,
    },
    queueSize: 2,
    partSize: PART_SIZE,
    leavePartsOnError: false,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    logger.error({ key }, "Upload timed out, aborting");
  }, UPLOAD_TIMEOUT_MS);

  try {
    await upload.done();
    clearTimeout(timeoutId);

    logger.info({ key, size, bucket: R2_CONFIG.bucketName }, "Streaming upload to R2 completed");

    return { key, size, fileName };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error({ err: error, key }, "Upload to R2 failed");
    throw error;
  }
}
