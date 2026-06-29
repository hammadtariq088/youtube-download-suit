import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../db/schema";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { AppError } from "../middleware/error-handler";
import type { AuthPayload } from "../middleware/auth";

async function ensureAdminExists(): Promise<void> {
  const [existing] = await db.select().from(users).where(eq(users.email, env.ADMIN_EMAIL)).limit(1);
  if (!existing) {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await db.insert(users).values({
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    });
    logger.info({ email: env.ADMIN_EMAIL }, "Default admin user created");
  }
}

let adminSeeded = false;

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!adminSeeded) {
        await ensureAdminExists();
        adminSeeded = true;
      }

      const { email, password } = req.body as { email: string; password: string };
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        return next(new AppError(401, "Invalid credentials", "UNAUTHORIZED"));
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return next(new AppError(401, "Invalid credentials", "UNAUTHORIZED"));
      }

      const payload: AuthPayload = { userId: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY_SECONDS });

      logger.info({ userId: user.id }, "User logged in");

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Login failed");
      next(new AppError(500, "Authentication failed"));
    }
  },

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return next(new AppError(401, "No token provided", "UNAUTHORIZED"));
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

      const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (!user) {
        return next(new AppError(401, "User not found", "UNAUTHORIZED"));
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
      });
    } catch {
      return next(new AppError(401, "Invalid token", "UNAUTHORIZED"));
    }
  },
};
