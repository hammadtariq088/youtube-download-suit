import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/auth";
import { authRateLimiter } from "../middleware/rate-limiter";

export const authRouter = Router();

authRouter.post("/login", authRateLimiter, validate(loginSchema), authController.login);
authRouter.post("/verify", authController.verify);
