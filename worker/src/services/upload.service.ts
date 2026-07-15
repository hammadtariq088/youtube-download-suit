import { readFile } from "node:fs/promises";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_CONFIG } from "../config/r2.js";
import { logger } from "../config/logger.js";
import { sanitizeFilename } from "../utils/filename.js";

const UPLOAD_TIMEOUT_MS = 300_000;

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

  logger.info({ localPath, key }, "Starting upload to R2");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    logger.error({ key }, "Upload timed out, aborting");
  }, UPLOAD_TIMEOUT_MS);

  try {
    const fileContent = await readFile(localPath);
    const size = fileContent.length;

    const contentType = ext === "mp4" ? "video/mp4" : "audio/mpeg";

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await r2Client.send(command, { abortSignal: controller.signal });

    clearTimeout(timeoutId);

    logger.info({ key, size, bucket: R2_CONFIG.bucketName }, "Upload to R2 completed");

    return { key, size, fileName };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error({ err: error, key }, "Upload to R2 failed");
    throw error;
  }
}
