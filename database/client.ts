import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dbFile = process.env.BRIQUEGO_DB_FILE === "e2e.db" ? "e2e.db" : "briquego.db";
const dbPath = path.join(process.cwd(), "data", dbFile);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const globalDb = globalThis as unknown as { briquegoSqlite?: Database.Database };
const sqlite = globalDb.briquegoSqlite ?? new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (!globalDb.briquegoSqlite) {
  migrate(drizzle(sqlite, { schema }), { migrationsFolder: path.resolve("database/migrations") });
  globalDb.briquegoSqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { dbPath, sqlite };
