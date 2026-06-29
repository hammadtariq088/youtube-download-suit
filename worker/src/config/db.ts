import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "../../../backend/src/db/schema";

const client = postgres(env.DATABASE_URL, {
  max: 5,
  prepare: false,
  ssl: "require",
});

export const db = drizzle(client, { schema });
export { client as sql };
