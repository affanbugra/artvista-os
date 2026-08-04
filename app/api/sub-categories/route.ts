import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subCategories } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const parentId = searchParams.get("parentId");

  if (!categoryId) return NextResponse.json([]);

  let rows;
  if (parentId === "null") {
    rows = await db.select().from(subCategories)
      .where(and(eq(subCategories.categoryId, categoryId), isNull(subCategories.parentId)))
      .orderBy(asc(subCategories.code));
  } else if (parentId) {
    rows = await db.select().from(subCategories)
      .where(and(eq(subCategories.categoryId, categoryId), eq(subCategories.parentId, parentId)))
      .orderBy(asc(subCategories.code));
  } else {
    rows = await db.select().from(subCategories)
      .where(eq(subCategories.categoryId, categoryId))
      .orderBy(asc(subCategories.code));
  }

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { categoryId, parentId, name, code, color } = await req.json();
  if (!categoryId || !name) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

  const id = `sc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const row = await db.insert(subCategories).values({
    id,
    categoryId,
    parentId: parentId ?? null,
    name,
    code: code ?? "00",
    color: color ?? "#e5e7eb",
  }).returning();

  return NextResponse.json(row[0], { status: 201 });
}
