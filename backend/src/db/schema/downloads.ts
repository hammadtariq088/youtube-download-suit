import { pgTable, uuid, varchar, text, integer, doublePrecision, timestamp, index } from "drizzle-orm/pg-core";

export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull(),
    title: varchar("title", { length: 500 }),
    format: varchar("format", { length: 10 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    progress: integer("progress").notNull().default(0),
    fileSize: doublePrecision("file_size"),
    r2Key: text("r2_key"),
    errorMessage: text("error_message"),
    processingTimeMs: integer("processing_time_ms"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("downloads_status_idx").on(table.status),
    createdAtIdx: index("downloads_created_at_idx").on(table.createdAt),
  }),
);

export type NewDownload = typeof downloads.$inferInsert;
export type Download = typeof downloads.$inferSelect;
