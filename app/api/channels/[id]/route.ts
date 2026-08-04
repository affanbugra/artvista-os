import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, sortOrder, isActive } = body;

  const updated = await db.update(channels)
    .set({ name, color: body.color, sortOrder, isActive })
    .where(eq(channels.id, params.id))
    .returning();

  if (!updated.length) return NextResponse.json({ error: "Kanal bulunamadı" }, { status: 404 });
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(channels).where(eq(channels.id, params.id));
  return NextResponse.json({ ok: true });
}
