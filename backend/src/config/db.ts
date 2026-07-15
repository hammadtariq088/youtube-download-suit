import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env.js";
import * as schema from "@yds/shared/db/schema";

const client = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema });
export { client as sql };
