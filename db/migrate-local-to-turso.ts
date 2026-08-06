/**
 * Lokal artvista.db içeriğini Turso'ya kopyalar.
 * Tek seferlik geçiş aracı — tekrar çalıştırmak güvenlidir (INSERT OR IGNORE).
 *
 * Çalıştır: npx tsx db/migrate-local-to-turso.ts
 */

import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const remoteUrl = process.env.TURSO_DATABASE_URL;
if (!remoteUrl) {
  console.error("TURSO_DATABASE_URL tanımlı değil.");
  process.exit(1);
}

const local = createClient({ url: "file:artvista.db" });
const remote = createClient({
  url: remoteUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Foreign key sırası: ebeveyn tablolar önce
const TABLE_ORDER = [
  "categories",
  "sub_categories",
  "product_statuses",
  "channels",
  "events",
  "products",
  "price_templates",
  "orders",
  "order_items",
  "frame_stock",
  "print_stock",
  "supplies",
  "stock_movements",
  "expenses",
];

async function main() {
  const found = await local.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'"
  );
  const names = found.rows.map((r) => r.name as string);

  // Bilinen sıra önce, listede olmayanlar sona
  const ordered = [
    ...TABLE_ORDER.filter((t) => names.includes(t)),
    ...names.filter((t) => !TABLE_ORDER.includes(t)),
  ];

  for (const table of ordered) {
    const data = await local.execute(`SELECT * FROM "${table}"`);
    if (data.rows.length === 0) {
      console.log(`○ ${table}: boş, atlandı`);
      continue;
    }

    const cols = data.columns;
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map(() => "?").join(", ");

    let inserted = 0;
    for (const r of data.rows) {
      const values = cols.map((c) => (r as Record<string, unknown>)[c] ?? null);
      await remote.execute({
        sql: `INSERT OR IGNORE INTO "${table}" (${colList}) VALUES (${placeholders})`,
        args: values as never,
      });
      inserted++;
    }
    console.log(`✓ ${table}: ${inserted} satır aktarıldı`);
  }

  console.log("\n🎉 Aktarım tamamlandı.");
  local.close();
  remote.close();
}

main().catch((err) => {
  console.error("❌ Aktarım hatası:", err);
  process.exit(1);
});
