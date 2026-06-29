import { readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "../config/env";
import { logger } from "../config/logger";

export async function cleanupDirectory(dirPath: string = env.TEMP_DOWNLOAD_DIR): Promise<number> {
  if (!existsSync(dirPath)) {
    return 0;
  }

  try {
    const files = await readdir(dirPath);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        await unlink(filePath);
        deletedCount++;
      } catch (error) {
        logger.warn({ err: error, filePath }, "Failed to delete file during cleanup");
      }
    }

    logger.info({ dirPath, deletedCount }, "Cleanup completed");
    return deletedCount;
  } catch (error) {
    logger.error({ err: error, dirPath }, "Cleanup failed");
    throw error;
  }
}

export async function cleanupSingleFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      logger.info({ filePath }, "File cleaned up");
    }
  } catch (error) {
    logger.warn({ err: error, filePath }, "Failed to clean up file");
  }
}
