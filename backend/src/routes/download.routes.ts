import { Router } from "express";
import { downloadController } from "../controllers/download.controller";
import { downloadRateLimiter } from "../middleware/rate-limiter";

export const downloadRouter = Router();

downloadRouter.get("/:id", downloadRateLimiter, downloadController.status);
downloadRouter.get("/:id/url", downloadRateLimiter, downloadController.url);
