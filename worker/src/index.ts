import { logger } from "./config/logger";
import { getWorkers, closeWorkers } from "./queue/consumers";
import { closeRedis } from "./config/redis";
import { startYtdlpUpdater, stopYtdlpUpdater, seedYtdlpVersion } from "./updater/ytdlp";
import { env } from "./config/env";
import { sql } from "./config/db";

const DB_RETRY_MAX_ATTEMPTS = 5;
const DB_RETRY_BASE_DELAY_MS = 2000;

async function waitForDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= DB_RETRY_MAX_ATTEMPTS; attempt++) {
    try {
      await sql`SELECT 1`;
      logger.info("Database connected");
      return;
    } catch (error) {
      if (attempt < DB_RETRY_MAX_ATTEMPTS) {
        const delay = DB_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.warn(
          { attempt, maxAttempts: DB_RETRY_MAX_ATTEMPTS, delay, err: error },
          "Database connection failed, retrying",
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.fatal({ err: error }, "Database connection failed after max retries");
        process.exit(1);
      }
    }
  }
}

async function startup(): Promise<void> {
  logger.info({ workerId: env.WORKER_ID, concurrency: env.WORKER_CONCURRENCY }, "Worker starting");

  await waitForDatabase();

  try {
    const workers = getWorkers();
    logger.info({ count: workers.length }, "Workers registered");

    for (const w of workers) {
      logger.info({ queue: w.name, concurrency: w.concurrency }, "Worker listening");
    }
  } catch (error) {
    logger.fatal({ err: error }, "Failed to register workers");
    process.exit(1);
  }

  try {
    await seedYtdlpVersion();
    startYtdlpUpdater();
  } catch (error) {
    logger.warn({ err: error }, "Failed to start yt-dlp updater");
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  logger.info("Worker startup complete");
}

async function shutdown(): Promise<void> {
  logger.info("Shutting down worker...");

  stopYtdlpUpdater();

  try {
    await closeWorkers();
    logger.info("Workers closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing workers");
  }

  try {
    await closeRedis();
    logger.info("Redis connection closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing Redis");
  }

  try {
    await sql.end();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing database");
  }

  logger.info("Shutdown complete");
  process.exit(0);
}

startup();
