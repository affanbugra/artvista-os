import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── 4.1 categories ───────────────────────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),             // "01", "02" ...
  name: text("name").notNull(),            // "Müzik", "Futbol"
  slug: text("slug").unique(),
  sortOrder: integer("sort_order").default(0),
  isActive: integer("is_active").default(1),
});

// ─── 4.2 products ─────────────────────────────────────────────────────────────
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),             // SKU
  name: text("name").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  subCategory1: text("sub_category_1"),    // "This Is", "Albüm", "Film"
  subCategory2: text("sub_category_2"),    // "Eski Tasarım", "Cars"
  isCustom: integer("is_custom").default(0),
  channels: text("channels"),             // JSON: ["shopier","trendyol","stant"]
  status: text("status").default("aktif"), // "aktif" | "pasif" | "taslak"
  imageUrl: text("image_url"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── 4.3 price_templates ──────────────────────────────────────────────────────
export const priceTemplates = sqliteTable("price_templates", {
  id: text("id").primaryKey(),
  channel: text("channel").notNull(),     // "trendyol" | "trendyol_gazze" | "shopier"
  size: text("size").notNull(),           // "15x21" | "21x30" | "30x42" | "42x60"
  salePrice: real("sale_price").notNull(),
  frameCost: real("frame_cost").default(0),
  printCost: real("print_cost").default(0),
  packageCost: real("package_cost").default(0),
  shippingCost: real("shipping_cost").default(0),
  commissionRate: real("commission_rate").default(0),
  serviceFee: real("service_fee").default(0),
  withholdingTax: real("withholding_tax").default(0),
  donationRate: real("donation_rate").default(0),
  netProfit: real("net_profit"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  uniqChannelSize: uniqueIndex("price_templates_channel_size").on(t.channel, t.size),
}));

// ─── 4.11 events (önce tanımlanmalı — orders buna referans veriyor) ───────────
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  location: text("location"),
  staff: text("staff"),
  standCost: real("stand_cost").default(0),
  workerCost: real("worker_cost").default(0),
  transport: real("transport").default(0),
  otherCost: real("other_cost").default(0),
  totalExpense: real("total_expense").default(0),
  totalRevenue: real("total_revenue").default(0),
  collection: real("collection").default(0),
  netProfit: real("net_profit"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── 4.4 orders ───────────────────────────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").unique().notNull(),
  channel: text("channel").notNull(),     // "shopier"|"trendyol"|"stant"|"elden"
  status: text("status").notNull().default("beklemede"),
  // "beklemede"|"hazirlaniyor"|"basildi"|"kargolandi"|"teslim"|"iptal"

  // Müşteri
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  address: text("address"),
  instagram: text("instagram"),

  // Finansal
  salePrice: real("sale_price"),
  collection: real("collection"),
  platformFee: real("platform_fee").default(0),
  shippingCost: real("shipping_cost").default(0),
  netRevenue: real("net_revenue"),

  // Kargo
  cargoCompany: text("cargo_company"),    // "MNG"|"Geliver"|"Yurt İçi"|"Elden"
  trackingNumber: text("tracking_number"),
  shippedAt: text("shipped_at"),
  deliveredAt: text("delivered_at"),

  // Checkboxlar
  thankYouSent: integer("thank_you_sent").default(0),
  photoTaken: integer("photo_taken").default(0),
  giftPackage: integer("gift_package").default(0),
  customerNote: text("customer_note"),

  eventId: text("event_id").references(() => events.id),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── 4.5 order_items ──────────────────────────────────────────────────────────
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id),
  productId: text("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  sku: text("sku"),
  quantity: integer("quantity").default(1),
  unitPrice: real("unit_price"),
  size: text("size"),                     // "21x30"|"30x42"|"42x60"|"15x21"
  frameColor: text("frame_color"),        // "Ahşap"|"Siyah"|"Beyaz"|null
  hasFrame: integer("has_frame").default(0),
  useStockPrint: integer("use_stock_print").default(0),
});

// ─── 4.6 frame_stock ──────────────────────────────────────────────────────────
export const frameStock = sqliteTable("frame_stock", {
  id: text("id").primaryKey(),
  size: text("size").notNull(),           // "15x21"|"21x30"|"30x42"|"42x60"
  color: text("color").notNull(),         // "Ahşap"|"Siyah"|"Beyaz"
  quantity: integer("quantity").default(0),
  defective: integer("defective").default(0),
  unitCost: real("unit_cost").default(0),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  uniqSizeColor: uniqueIndex("frame_stock_size_color").on(t.size, t.color),
}));

// ─── 4.7 print_stock ──────────────────────────────────────────────────────────
export const printStock = sqliteTable("print_stock", {
  id: text("id").primaryKey(),
  productId: text("product_id").references(() => products.id),
  productName: text("product_name"),
  size: text("size").notNull(),
  quantity: integer("quantity").default(0),
  unitCost: real("unit_cost").default(0),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  uniqProductSize: uniqueIndex("print_stock_product_size").on(t.productId, t.size),
}));

// ─── 4.8 supplies ─────────────────────────────────────────────────────────────
export const supplies = sqliteTable("supplies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),           // "Kargo Kutusu", "Teşekkür Kartı"
  category: text("category"),             // "ambalaj"|"kirtasiye"|"diger"
  quantity: integer("quantity").default(0),
  unit: text("unit").default("adet"),
  unitCost: real("unit_cost").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  notes: text("notes"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── 4.9 stock_movements ──────────────────────────────────────────────────────
export const stockMovements = sqliteTable("stock_movements", {
  id: text("id").primaryKey(),
  itemType: text("item_type").notNull(),  // "frame"|"print"|"supply"
  itemId: text("item_id").notNull(),
  movementType: text("movement_type").notNull(), // "giris"|"cikis"|"duzeltme"|"defolu"
  quantity: integer("quantity").notNull(),
  reason: text("reason"),                // "siparis:ORD-001"|"manuel"|"alinaldi"
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── 4.10 expenses ────────────────────────────────────────────────────────────
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  // "cerceve_alim"|"baski"|"kargo"|"paketleme"|"reklam"|"grafik"|"internet"|"diger"
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  eventId: text("event_id").references(() => events.id),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ─── sub_categories ───────────────────────────────────────────────────────────
export const subCategories = sqliteTable("sub_categories", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
  code: text("code").default("00"),     // alt kat 1 → "01" | alt kat 2 → "001"
  color: text("color").default("#e5e7eb"),
  sortOrder: integer("sort_order").default(0),
});

// ─── product_statuses ─────────────────────────────────────────────────────────
export const productStatuses = sqliteTable("product_statuses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#e5e7eb"),
  sortOrder: integer("sort_order").default(0),
});

// ─── channels ─────────────────────────────────────────────────────────────────
export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#e5e7eb"),
  sortOrder: integer("sort_order").default(0),
  isActive: integer("is_active").default(1),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PriceTemplate = typeof priceTemplates.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type FrameStock = typeof frameStock.$inferSelect;
export type PrintStock = typeof printStock.$inferSelect;
export type Supply = typeof supplies.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type ProductStatus = typeof productStatuses.$inferSelect;
export type SubCategory = typeof subCategories.$inferSelect;
