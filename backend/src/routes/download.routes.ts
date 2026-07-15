import { Router } from "express";
import { downloadController } from "../controllers/download.controller.js";
import { pollRateLimiter } from "../middleware/rate-limiter.js";

export const downloadRouter = Router();

downloadRouter.get("/:id", pollRateLimiter, downloadController.status);
downloadRouter.get("/:id/url", pollRateLimiter, downloadController.url);
