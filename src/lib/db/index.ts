import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing SUPABASE_DB_URL (or DATABASE_URL) environment variable");
}

const queryClient = postgres(connectionString, {
  prepare: false,
  max: 1,
});

export const db = drizzle(queryClient, { schema });
