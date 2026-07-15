import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "../config/db.js";
import { logger } from "../config/logger.js";

export async function runMigrations(): Promise<void> {
  logger.info("Running database migrations...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("Migrations completed successfully");
  } catch (error) {
    logger.error({ err: error }, "Migration failed");
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  await sql.end();
}
