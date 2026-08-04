import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

// TURSO_DATABASE_URL varsa bulut (Turso), yoksa lokal dosya.
// Böylece geliştirme lokalde, yayın paylaşımlı DB üzerinde çalışır.
const url = process.env.TURSO_DATABASE_URL || "file:artvista.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
