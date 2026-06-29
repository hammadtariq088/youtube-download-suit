import { readFile } from "node:fs/promises";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_CONFIG } from "../config/r2";
import { logger } from "../config/logger";
import path from "node:path";

export interface UploadResult {
  key: string;
  size: number;
}

export async function uploadFile(localPath: string): Promise<UploadResult> {
  const fileName = path.basename(localPath);
  const key = `downloads/${Date.now()}-${fileName}`;

  logger.info({ localPath, key }, "Starting upload to R2");

  try {
    const fileContent = await readFile(localPath);
    const size = fileContent.length;

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: getContentType(path.extname(fileName)),
    });

    await r2Client.send(command);

    logger.info({ key, size, bucket: R2_CONFIG.bucketName }, "Upload to R2 completed");

    return { key, size };
  } catch (error) {
    logger.error({ err: error, key }, "Upload to R2 failed");
    throw error;
  }
}

function getContentType(extension: string): string {
  const map: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
  };
  return map[extension] || "application/octet-stream";
}
