import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { printStock } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// GET /api/print-stock?productIds=id1,id2,...
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("productIds");
  if (!ids) return NextResponse.json([]);
  const productIds = ids.split(",").filter(Boolean);
  const rows = await db
    .select()
    .from(printStock)
    .where(inArray(printStock.productId, productIds));
  return NextResponse.json(rows);
}

// POST /api/print-stock  { productId, size, quantity }
export async function POST(req: NextRequest) {
  const { productId, size, quantity } = await req.json();
  if (!productId || !size) return NextResponse.json({ error: "eksik alan" }, { status: 400 });

  const id = `${productId}_${size}`;
  await db
    .insert(printStock)
    .values({ id, productId, size, quantity: quantity ?? 0, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: [printStock.productId, printStock.size],
      set: { quantity: quantity ?? 0, updatedAt: new Date().toISOString() },
    });

  return NextResponse.json({ ok: true });
}
