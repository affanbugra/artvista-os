import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row = await db.select().from(products).where(eq(products.id, params.id));
  if (!row.length) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json(row[0]);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, categoryId, subCategory1, subCategory2, isCustom, channels, status, imageUrl, notes } = body;

  const updated = await db.update(products)
    .set({
      name,
      categoryId,
      subCategory1,
      subCategory2,
      isCustom: isCustom ? 1 : 0,
      channels: channels ? JSON.stringify(channels) : null,
      status,
      imageUrl,
      notes,
    })
    .where(eq(products.id, params.id))
    .returning();

  if (!updated.length) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(products).where(eq(products.id, params.id));
  return NextResponse.json({ ok: true });
}
