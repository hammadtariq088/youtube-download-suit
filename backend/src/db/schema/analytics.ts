import { pgTable, uuid, date, integer, doublePrecision, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const analytics = pgTable(
  "analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date").notNull(),
    totalDownloads: integer("total_downloads").notNull().default(0),
    successfulDownloads: integer("successful_downloads").notNull().default(0),
    failedDownloads: integer("failed_downloads").notNull().default(0),
    avgProcessingTimeMs: doublePrecision("avg_processing_time_ms").default(0),
    topFormats: jsonb("top_formats").default({}),
    topQualities: jsonb("top_qualities").default({}),
  },
  (table) => ({
    dateIdx: uniqueIndex("analytics_date_idx").on(table.date),
  }),
);

export type NewAnalytics = typeof analytics.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
