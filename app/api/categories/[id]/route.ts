import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, subCategories, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = decodeURIComponent(params.id);
    const body = await req.json();
    const { name, slug, sortOrder, isActive } = body;

    const updated = await db.update(categories)
      .set({
        name,
        slug,
        sortOrder,
        isActive,
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Kategori güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = decodeURIComponent(params.id);

    // 1. Kategoriye ait alt kategorileri sil
    await db.delete(subCategories).where(eq(subCategories.categoryId, id));

    // 2. Bu kategoriye bağlı ürünlerin categoryId'sini boşa çıkar
    await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));

    // 3. Kategoriyi sil
    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Kategori silme hatası:", err);
    return NextResponse.json({ error: err?.message || "Kategori silinemedi" }, { status: 500 });
  }
}
