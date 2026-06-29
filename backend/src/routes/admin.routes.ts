import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { paginationSchema, queueActionSchema } from "../validators/admin";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/analytics", adminController.analytics);
adminRouter.get("/downloads", validate(paginationSchema), adminController.downloads);
adminRouter.get("/jobs", validate(paginationSchema), adminController.jobs);
adminRouter.get("/errors", validate(paginationSchema), adminController.errors);
adminRouter.get("/worker/status", adminController.workerStatus);
adminRouter.get("/queue", adminController.queue);
adminRouter.get("/storage", adminController.storage);

adminRouter.post("/jobs/:id/retry", adminController.retryJob);
adminRouter.delete("/jobs/:id", adminController.deleteJob);
adminRouter.post("/queue/:name/clear", validate(queueActionSchema), adminController.clearQueue);
adminRouter.post("/ytdlp/update", adminController.updateYtdlp);

adminRouter.get("/cookies", adminController.listCookies);
adminRouter.post("/cookies", adminController.uploadCookie);
adminRouter.delete("/cookies/:id", adminController.deleteCookie);
