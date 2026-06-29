import { Router } from "express";
import { videoController } from "../controllers/video.controller";
import { validate } from "../middleware/validate";
import { videoInfoSchema, convertSchema } from "../validators/video";
import { downloadRateLimiter } from "../middleware/rate-limiter";

export const videoRouter = Router();

videoRouter.post("/info", downloadRateLimiter, validate(videoInfoSchema), videoController.info);
videoRouter.post("/convert", downloadRateLimiter, validate(convertSchema), videoController.convert);
