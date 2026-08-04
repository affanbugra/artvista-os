import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, slug, sortOrder, isActive } = body;

  const updated = await db.update(categories)
    .set({
      name,
      slug,
      sortOrder,
      isActive,
    })
    .where(eq(categories.id, params.id))
    .returning();

  if (!updated.length) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(categories).where(eq(categories.id, params.id));
  return NextResponse.json({ ok: true });
}
