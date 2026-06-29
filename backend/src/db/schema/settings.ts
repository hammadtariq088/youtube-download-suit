import { pgTable, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const settings = pgTable(
  "settings",
  {
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("settings_key_idx").on(table.key),
  }),
);

export type NewSetting = typeof settings.$inferInsert;
export type Setting = typeof settings.$inferSelect;
