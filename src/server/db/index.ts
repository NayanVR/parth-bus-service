import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  prepare: false, // Disable prepared statements for Supabase Transaction Mode compatibility
  max: 1, // Limit connections per lambda to prevent exhaustion
  idle_timeout: 20, // Close idle connections quickly
  connect_timeout: 10, // Fail fast if connection hangs
});

if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
