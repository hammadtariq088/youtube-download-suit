import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middleware/error-handler";
import { healthRouter } from "./routes/health.routes";
import { videoRouter } from "./routes/video.routes";
import { downloadRouter } from "./routes/download.routes";
import { generalRateLimiter } from "./middleware/rate-limiter";

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(generalRateLimiter);

app.use("/api/health", healthRouter);
app.use("/api/video", videoRouter);
app.use("/api/download", downloadRouter);

app.use(errorHandler);

async function start(): Promise<void> {
  try {
    app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, "Backend API server started");
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

start();

export { app };
