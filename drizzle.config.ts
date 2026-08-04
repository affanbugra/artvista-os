import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const tursoUrl = process.env.TURSO_DATABASE_URL;

export default (
  tursoUrl
    ? {
        schema: "./db/schema.ts",
        out: "./db/migrations",
        dialect: "turso",
        dbCredentials: {
          url: tursoUrl,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
      }
    : {
        schema: "./db/schema.ts",
        out: "./db/migrations",
        dialect: "sqlite",
        dbCredentials: {
          url: "file:artvista.db",
        },
      }
) satisfies Config;
