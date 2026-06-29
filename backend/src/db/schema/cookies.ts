import { pgTable, uuid, varchar, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const cookies = pgTable(
  "cookies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    profile: varchar("profile", { length: 100 }).notNull().default("default"),
    content: text("content").notNull(),
    isActive: boolean("is_active").notNull().default(false),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: uniqueIndex("cookies_active_idx").on(table.isActive).where(sql`${table.isActive} = true`),
  }),
);

export type NewCookie = typeof cookies.$inferInsert;
export type Cookie = typeof cookies.$inferSelect;
