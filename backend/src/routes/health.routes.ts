import { Router } from "express";
import { healthController } from "../controllers/health.controller";

export const healthRouter = Router();

healthRouter.get("/", healthController.health);
healthRouter.get("/worker/status", healthController.workerStatus);
healthRouter.get("/version", healthController.version);
healthRouter.get("/queue", healthController.queue);
