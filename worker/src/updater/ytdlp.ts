import { db } from "../config/db";
import { settings } from "../../../backend/src/db/schema";
import { updateYtdlp, getYtdlpVersion } from "../services/youtube.service";
import { logger } from "../config/logger";
import { YTDLP_UPDATE_INTERVAL_MS } from "@yds/shared/constants";

let updateInterval: ReturnType<typeof setInterval> | null = null;

export async function checkAndUpdateYtdlp(): Promise<void> {
  logger.info("Running scheduled yt-dlp update check");

  const result = updateYtdlp();

  await db
    .insert(settings)
    .values({
      key: "ytdlp_version",
      value: result.version,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: result.version, updatedAt: new Date() },
    });

  if (result.success) {
    logger.info({ version: result.version }, "yt-dlp updated successfully");
  } else {
    logger.warn({ version: result.version }, "yt-dlp update failed, current version retained");
  }
}

export async function seedYtdlpVersion(): Promise<void> {
  try {
    const version = getYtdlpVersion();
    await db
      .insert(settings)
      .values({ key: "ytdlp_version", value: version, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: version, updatedAt: new Date() } });
    logger.info({ version }, "yt-dlp version seeded");
  } catch (error) {
    logger.warn({ err: error }, "Failed to seed yt-dlp version");
  }
}

export function startYtdlpUpdater(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(checkAndUpdateYtdlp, YTDLP_UPDATE_INTERVAL_MS);
  logger.info({ intervalMs: YTDLP_UPDATE_INTERVAL_MS }, "yt-dlp updater scheduled");

  checkAndUpdateYtdlp();
}

export function stopYtdlpUpdater(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    logger.info("yt-dlp updater stopped");
  }
}
