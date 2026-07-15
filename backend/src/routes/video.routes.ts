import { Router } from "express";
import { videoController } from "../controllers/video.controller.js";
import { validate } from "../middleware/validate.js";
import { videoInfoSchema, convertSchema } from "../validators/video.js";
import { downloadRateLimiter } from "../middleware/rate-limiter.js";

export const videoRouter = Router();

videoRouter.post("/info", downloadRateLimiter, validate(videoInfoSchema), videoController.info);
videoRouter.post("/convert", downloadRateLimiter, validate(convertSchema), videoController.convert);
