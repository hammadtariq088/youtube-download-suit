import { pgTable, uuid, varchar, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const workerLogs = pgTable(
  "worker_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    level: varchar("level", { length: 10 }).notNull(),
    message: text("message").notNull(),
    meta: jsonb("meta"),
    jobId: varchar("job_id", { length: 255 }),
    workerId: varchar("worker_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    levelIdx: index("worker_logs_level_idx").on(table.level),
    createdAtIdx: index("worker_logs_created_at_idx").on(table.createdAt),
    jobIdIdx: index("worker_logs_job_id_idx").on(table.jobId),
  }),
);

export type NewWorkerLog = typeof workerLogs.$inferInsert;
export type WorkerLog = typeof workerLogs.$inferSelect;
