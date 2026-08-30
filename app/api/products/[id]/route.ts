import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, printStock, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = decodeURIComponent(params.id);
    const row = await db.select().from(products).where(eq(products.id, id));
    if (!row.length) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    return NextResponse.json(row[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Hata oluştu" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = decodeURIComponent(params.id);
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
      .where(eq(products.id, id))
      .returning();

    if (!updated.length) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Güncelleme başarısız" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = decodeURIComponent(params.id);

    // 1. Ürünün baskı stoklarını (print_stock) temizle (Foreign Key hatasını önler)
    await db.delete(printStock).where(eq(printStock.productId, id));

    // 2. Sipariş geçmişi bozulmaması için ilgili sipariş kalemlerindeki product_id'yi boşa çıkar
    await db.update(orderItems).set({ productId: null }).where(eq(orderItems.productId, id));

    // 3. Ürünü sil
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Ürün silme hatası:", err);
    return NextResponse.json({ error: err?.message || "Ürün silinemedi" }, { status: 500 });
  }
}
