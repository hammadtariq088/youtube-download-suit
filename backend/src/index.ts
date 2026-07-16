import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.routes.js";
import { videoRouter } from "./routes/video.routes.js";
import { downloadRouter } from "./routes/download.routes.js";
import { generalRateLimiter } from "./middleware/rate-limiter.js";
import { runMigrations, closeConnection } from "./db/migrate.js";
import { closeQueues } from "./queue/producer.js";
import { closeRedis } from "./config/redis.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(generalRateLimiter);

app.use("/api/health", healthRouter);
app.use("/api/video", videoRouter);
app.use("/api/download", downloadRouter);

app.use(errorHandler);

let server: ReturnType<typeof express.prototype.listen> | null = null;
let shuttingDown = false;

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("Shutting down backend API...");

  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }

  try {
    await closeQueues();
    logger.info("Queues closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing queues");
  }

  try {
    await closeRedis();
    logger.info("Redis connection closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing Redis");
  }

  try {
    await closeConnection();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing database");
  }

  logger.info("Shutdown complete");
  process.exit(0);
}

async function start(): Promise<void> {
  try {
    await runMigrations();
  } catch (error) {
    logger.error({ err: error }, "Migration failed, starting anyway");
  }

  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, "Backend API server started");
  });

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start();

export { app };
