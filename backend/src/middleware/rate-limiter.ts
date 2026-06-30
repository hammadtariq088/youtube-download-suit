import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "@yds/shared/constants";

export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});

export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts, please try again later.", code: "RATE_LIMITED" },
});

export const downloadRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.DOWNLOAD.windowMs,
  max: RATE_LIMITS.DOWNLOAD.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many download requests, please try again later.", code: "RATE_LIMITED" },
});

export const pollRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});
