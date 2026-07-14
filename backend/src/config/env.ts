import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url(),

  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),
  R2_SIGNED_URL_EXPIRY: z.coerce.number().default(600),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  MAX_DURATION_SECONDS: z.coerce.number().default(14400),
  MAX_FILE_SIZE_MB: z.coerce.number().default(2048),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
