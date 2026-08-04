import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productStatuses } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(productStatuses).orderBy(asc(productStatuses.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, sortOrder } = body;
  if (!id || !name) return NextResponse.json({ error: "id ve name zorunlu" }, { status: 400 });

  const row = await db.insert(productStatuses).values({
    id: id.toLowerCase().replace(/\s+/g, "_"),
    name,
    color: body.color ?? "#e5e7eb",
    sortOrder: sortOrder ?? 99,
  }).returning();

  return NextResponse.json(row[0], { status: 201 });
}
