import { Router } from "express";
import { downloadController } from "../controllers/download.controller";
import { pollRateLimiter } from "../middleware/rate-limiter";

export const downloadRouter = Router();

downloadRouter.get("/:id", pollRateLimiter, downloadController.status);
downloadRouter.get("/:id/url", pollRateLimiter, downloadController.url);
