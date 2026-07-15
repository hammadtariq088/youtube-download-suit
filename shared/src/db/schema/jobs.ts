import { pgTable, uuid, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { downloads } from "./downloads.js";

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    downloadId: uuid("download_id").references(() => downloads.id, { onDelete: "cascade" }),
    queue: varchar("queue", { length: 50 }).notNull(),
    bullJobId: varchar("bull_job_id", { length: 255 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    lastError: text("last_error"),
    result: text("result"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    downloadIdIdx: index("jobs_download_id_idx").on(table.downloadId),
    statusIdx: index("jobs_status_idx").on(table.status),
    queueIdx: index("jobs_queue_idx").on(table.queue),
  }),
);

export type NewJob = typeof jobs.$inferInsert;
export type Job = typeof jobs.$inferSelect;
