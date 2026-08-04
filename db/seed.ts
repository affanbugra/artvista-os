/**
 * Seed script — kategoriler + fiyat şablonları
 * Çalıştır: npx tsx db/seed.ts
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "dotenv";
import { categories, priceTemplates, frameStock, supplies } from "./schema";

config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:artvista.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client);

// ─── Kategoriler ─────────────────────────────────────────────────────────────
const categoryData = [
  { id: "00", name: "Özel Tasarım",         slug: "ozel-tasarim",         sortOrder: 0 },
  { id: "01", name: "Müzik",                slug: "muzik",                sortOrder: 1 },
  { id: "02", name: "Dizi-Film",             slug: "dizi-film",            sortOrder: 2 },
  { id: "03", name: "Futbol",               slug: "futbol",               sortOrder: 3 },
  { id: "04", name: "Çiçekler",             slug: "cicekler",             sortOrder: 4 },
  { id: "05", name: "Minimal",              slug: "minimal",              sortOrder: 5 },
  { id: "06", name: "Dini",                 slug: "dini",                 sortOrder: 6 },
  { id: "07", name: "Edebiyat",             slug: "edebiyat",             sortOrder: 7 },
  { id: "08", name: "Zinciri Kırma",        slug: "zinciri-kirma",        sortOrder: 8 },
  { id: "99", name: "Diğer Posterler",      slug: "diger-posterler",      sortOrder: 9 },
];

// ─── Fiyat Şablonları (Excel Fiyat Listesinden) ───────────────────────────────
const sizes = ["15x21", "21x30", "30x42", "42x60"];

const trendyolPrices: Record<string, number> = {
  "15x21": 349, "21x30": 449, "30x42": 549, "42x60": 999,
};
const shopierPrices: Record<string, number> = {
  "15x21": 349, "21x30": 449, "30x42": 449, "42x60": 899,
};
const printCosts: Record<string, number> = {
  "15x21": 11.75, "21x30": 22.5, "30x42": 32.5, "42x60": 250,
};
const frameCosts: Record<string, number> = {
  "15x21": 50, "21x30": 80, "30x42": 120, "42x60": 200,
};

const priceTemplateData = [
  // Trendyol
  ...sizes.map((size) => ({
    id: `trendyol-${size}`,
    channel: "trendyol",
    size,
    salePrice: trendyolPrices[size],
    printCost: printCosts[size],
    packageCost: 8,
    shippingCost: 0,
    commissionRate: 20,
    serviceFee: 0.5,
    withholdingTax: 2,
    donationRate: 0,
    netProfit: null,
  })),
  // Trendyol Gazze (aynı fiyat, %10 bağış)
  ...sizes.map((size) => ({
    id: `trendyol_gazze-${size}`,
    channel: "trendyol_gazze",
    size,
    salePrice: trendyolPrices[size],
    printCost: printCosts[size],
    packageCost: 8,
    shippingCost: 0,
    commissionRate: 20,
    serviceFee: 0.5,
    withholdingTax: 2,
    donationRate: 10,
    netProfit: null,
  })),
  // Shopier
  ...sizes.map((size) => ({
    id: `shopier-${size}`,
    channel: "shopier",
    size,
    salePrice: shopierPrices[size],
    printCost: printCosts[size],
    packageCost: 8,
    shippingCost: 30,
    commissionRate: 5.99,
    serviceFee: 0.5,
    withholdingTax: 0,
    donationRate: 0,
    netProfit: null,
  })),
];

// ─── Çerçeve Stok — başlangıç satırları ──────────────────────────────────────
const frameStockData = sizes.flatMap((size) =>
  ["Ahşap", "Siyah", "Beyaz"].map((color) => ({
    id: `${size}-${color}`,
    size,
    color,
    quantity: 0,
    defective: 0,
    unitCost: frameCosts[size],
  }))
);

// ─── Sarf Malzemeleri başlangıç ───────────────────────────────────────────────
const suppliesData = [
  { id: "supply-001", name: "Kargo Kutusu",     category: "ambalaj",   quantity: 0, unit: "adet", unitCost: 8,   lowStockThreshold: 20 },
  { id: "supply-002", name: "Teşekkür Kartı",   category: "kirtasiye", quantity: 0, unit: "adet", unitCost: 1,   lowStockThreshold: 50 },
  { id: "supply-003", name: "Bant",             category: "ambalaj",   quantity: 0, unit: "adet", unitCost: 5,   lowStockThreshold: 5  },
  { id: "supply-004", name: "Hediye Paketi",    category: "ambalaj",   quantity: 0, unit: "adet", unitCost: 15,  lowStockThreshold: 10 },
  { id: "supply-005", name: "Kartvizit",        category: "kirtasiye", quantity: 0, unit: "adet", unitCost: 0.5, lowStockThreshold: 50 },
];

// ─── Seed çalıştır ────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seed başlıyor...");

  // Kategoriler
  for (const cat of categoryData) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }
  console.log(`✅ ${categoryData.length} kategori eklendi`);

  // Fiyat şablonları
  for (const tmpl of priceTemplateData) {
    await db.insert(priceTemplates).values(tmpl).onConflictDoNothing();
  }
  console.log(`✅ ${priceTemplateData.length} fiyat şablonu eklendi`);

  // Çerçeve stok satırları
  for (const frame of frameStockData) {
    await db.insert(frameStock).values(frame).onConflictDoNothing();
  }
  console.log(`✅ ${frameStockData.length} çerçeve stok satırı eklendi`);

  // Sarf malzemeleri
  for (const supply of suppliesData) {
    await db.insert(supplies).values(supply).onConflictDoNothing();
  }
  console.log(`✅ ${suppliesData.length} sarf malzemesi eklendi`);

  console.log("🎉 Seed tamamlandı!");
  client.close();
}

seed().catch((err) => {
  console.error("❌ Seed hatası:", err);
  process.exit(1);
});
