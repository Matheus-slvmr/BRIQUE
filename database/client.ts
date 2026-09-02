import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbFile = process.env.BRIQUEGO_DB_FILE === "e2e.db" ? "e2e.db" : "briquego.db";
export const dbPath = path.join(process.cwd(), "data", dbFile);
export const isRemoteDatabase = Boolean(process.env.TURSO_DATABASE_URL) && process.env.BRIQUEGO_DB_FILE !== "e2e.db";

if (!isRemoteDatabase) fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const globalDb = globalThis as unknown as { briquegoClient?: ReturnType<typeof createClient>; briquegoMigrated?: boolean };
export const client = globalDb.briquegoClient ?? createClient({
  url: process.env.TURSO_DATABASE_URL ?? `file:${dbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
export const db = drizzle(client, { schema });

if (!globalDb.briquegoMigrated) {
  await migrate(db, { migrationsFolder: path.resolve("database/migrations") });
  globalDb.briquegoClient = client;
  globalDb.briquegoMigrated = true;
}
