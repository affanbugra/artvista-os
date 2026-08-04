import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");

  const query = db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.id));

  const rows = categoryId
    ? await db
        .select({ product: products, category: categories })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.categoryId, categoryId))
        .orderBy(asc(products.id))
    : await query;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, categoryId, subCategory1, subCategory2, isCustom, channels, status, imageUrl, notes } = body;

  if (!id || !name) {
    return NextResponse.json({ error: "id (SKU) ve name zorunlu" }, { status: 400 });
  }

  const row = await db.insert(products).values({
    id,
    name,
    categoryId,
    subCategory1,
    subCategory2,
    isCustom: isCustom ? 1 : 0,
    channels: channels ? JSON.stringify(channels) : null,
    status: status || "aktif",
    imageUrl,
    notes,
  }).returning();

  return NextResponse.json(row[0], { status: 201 });
}
