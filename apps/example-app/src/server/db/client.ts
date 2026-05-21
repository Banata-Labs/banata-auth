import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { bootstrapStatements } from "./schema";

const dbPath = path.resolve(process.cwd(), "data", "tickets.sqlite");
mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath, { create: true });
sqlite.exec(String(bootstrapStatements));

export const database = drizzle(sqlite);
export { sqlite };
