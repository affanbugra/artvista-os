import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, slug, sortOrder } = body;

  if (!id || !name) {
    return NextResponse.json({ error: "id ve name zorunlu" }, { status: 400 });
  }

  const existing = await db.select().from(categories).where(eq(categories.id, id));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Bu kategori kodu zaten var" }, { status: 409 });
  }

  const row = await db.insert(categories).values({
    id,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    sortOrder: sortOrder ?? 99,
    isActive: 1,
  }).returning();

  return NextResponse.json(row[0], { status: 201 });
}
