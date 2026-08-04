import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get("prefix"); // ör: "01-02-003"

  if (!prefix) return NextResponse.json({ error: "prefix gerekli" }, { status: 400 });

  // prefix ile başlayan tüm SKU'ları çek
  const rows = await db.select({ id: products.id }).from(products).where(like(products.id, `${prefix}-%`));

  let maxSeq = 0;
  for (const row of rows) {
    const parts = row.id.split("-");
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  const next = String(maxSeq + 1).padStart(3, "0");
  return NextResponse.json({ sku: `${prefix}-${next}` });
}
