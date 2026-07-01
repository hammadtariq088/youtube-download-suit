import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  WORKER_ID: z.string().default("worker-1"),
  WORKER_CONCURRENCY: z.coerce.number().default(3),
  TEMP_DOWNLOAD_DIR: z.string().default("/tmp/yds-downloads"),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url(),

  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),

  APIFY_TOKEN: z.string().optional().default(""),
  APIFY_ACTOR_ID: z.string().optional().default(""),

  YT_COOKIES_FILE: z.string().optional().default(""),
  YT_COOKIES_FROM_BROWSER: z.string().optional().default(""),

  METADATA_CACHE_TTL_SECONDS: z.coerce.number().default(86400),

  MAX_DURATION_SECONDS: z.coerce.number().default(14400),
  MAX_FILE_SIZE_MB: z.coerce.number().default(2048),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid worker environment variables:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
