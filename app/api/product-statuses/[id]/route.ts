import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productStatuses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, sortOrder } = body;
  const updated = await db.update(productStatuses).set({ name, color: body.color, sortOrder }).where(eq(productStatuses.id, params.id)).returning();
  if (!updated.length) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(productStatuses).where(eq(productStatuses.id, params.id));
  return NextResponse.json({ ok: true });
}
