import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, code, color } = await req.json();
  const updated = await db.update(subCategories).set({ name, code, color }).where(eq(subCategories.id, params.id)).returning();
  if (!updated.length) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(subCategories).where(eq(subCategories.id, params.id));
  return NextResponse.json({ ok: true });
}
