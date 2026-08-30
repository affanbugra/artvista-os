"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Pencil, Trash2, Settings2, Search, ChevronUp, ChevronDown, X, ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UrunForm } from "@/components/urunler/UrunForm";
import { KategoriForm } from "@/components/urunler/KategoriForm";
import { AyarlarPanel } from "@/components/urunler/AyarlarPanel";
import type { Category, Product, Channel, ProductStatus } from "@/db/schema";

// alt kategori string → tutarlı pastel renk
function strToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { bg: `hsl(${h},55%,88%)`, text: `hsl(${h},45%,35%)` };
}

export default function UrunlerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<{ product: Product; category: Category | null }[]>([]);
  const [channelMap, setChannelMap] = useState<Record<string, { name: string; color: string }>>({});
  const [statusMap, setStatusMap] = useState<Record<string, { name: string; color: string }>>({});
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterSub1, setFilterSub1] = useState("");
  const [sortField, setSortField] = useState<"id" | "name" | "categoryId" | "subCategory1" | "subCategory2" | "status" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [urunFormOpen, setUrunFormOpen] = useState(false);
  const [editingUrun, setEditingUrun] = useState<Product | null>(null);
  const [kategoriFormOpen, setKategoriFormOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Category | null>(null);
  const [ayarlarOpen, setAyarlarOpen] = useState(false);
  const [stokPaneli, setStokPaneli] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; sku: string } | null>(null);
  const [modalViewMode, setModalViewMode] = useState<"a4" | "original">("a4");
  const [modalZoom, setModalZoom] = useState<number>(1.65);
  // key: "productId_size" → quantity
  const [printStokMap, setPrintStokMap] = useState<Record<string, number>>({});
  // inline edit: key "productId_size"
  const [editingStok, setEditingStok] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState("");

  const BOYUTLAR = ["15x21", "21x30", "30x42", "42x60"] as const;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, chRes, stRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products"),
        fetch("/api/channels"),
        fetch("/api/product-statuses"),
      ]);
      const prods = await prodRes.json();
      setCategories(await catRes.json());
      setProducts(prods);
      const chs: Channel[] = await chRes.json();
      const sts: ProductStatus[] = await stRes.json();
      setChannelMap(Object.fromEntries(chs.map((c) => [c.id, { name: c.name, color: (c as any).color ?? "#e5e7eb" }])));
      setStatusMap(Object.fromEntries(sts.map((s) => [s.id, { name: s.name, color: (s as any).color ?? "#e5e7eb" }])));
      // baskı stok
      const ids = prods.map((p: any) => p.product.id).join(",");
      if (ids) {
        const psRes = await fetch(`/api/print-stock?productIds=${ids}`);
        const psRows: { productId: string; size: string; quantity: number }[] = await psRes.json();
        const map: Record<string, number> = {};
        psRows.forEach(r => { map[`${r.productId}_${r.size}`] = r.quantity; });
        setPrintStokMap(map);
      }
    } catch (err) {
      console.error("Veri yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function saveStok(productId: string, size: string, val: string) {
    const quantity = parseInt(val, 10);
    if (isNaN(quantity)) return;
    const key = `${productId}_${size}`;
    setPrintStokMap(prev => ({ ...prev, [key]: quantity }));
    await fetch("/api/print-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, quantity }),
    });
  }

  async function deleteProduct(id: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Ürün silinirken bir hata oluştu.");
        return;
      }
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Ürün silinirken sunucuyla bağlantı kurulamadı.");
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Kategori silinirken bir hata oluştu.");
        return;
      }
      setActiveTab("all");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Kategori silinirken sunucuyla bağlantı kurulamadı.");
    }
  }

  const customProducts = products.filter((p) => p.product.isCustom === 1);

  const filteredProducts = useMemo(() => {
    let list = activeTab === "all"
      ? products
      : activeTab === "ozel-tasarim"
      ? customProducts
      : products.filter((p) => p.product.categoryId === activeTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(({ product }) =>
        product.name.toLowerCase().includes(q) || product.id.toLowerCase().includes(q)
      );
    }
    if (filterStatus) list = list.filter(({ product }) => product.status === filterStatus);
    if (filterChannel) list = list.filter(({ product }) => {
      const chs: string[] = product.channels ? JSON.parse(product.channels) : [];
      return chs.includes(filterChannel);
    });
    if (filterSub1) list = list.filter(({ product }) => product.subCategory1 === filterSub1);

    if (sortField) {
      list = [...list].sort((a, b) => {
        const av = (a.product[sortField] ?? "") as string;
        const bv = (b.product[sortField] ?? "") as string;
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return list;
  }, [products, customProducts, activeTab, search, filterStatus, filterChannel, filterSub1, sortField, sortDir]);

  const allSub1 = useMemo(() =>
    [...new Set(products.map(p => p.product.subCategory1).filter(Boolean))] as string[],
    [products]
  );

  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <ChevronUp size={12} className="text-zinc-300" />;
    return sortDir === "asc" ? <ChevronUp size={12} className="text-zinc-600" /> : <ChevronDown size={12} className="text-zinc-600" />;
  }

  const hasFilters = search || filterStatus || filterChannel || filterSub1;

  const totalByCategory = (catId: string) =>
    products.filter((p) => p.product.categoryId === catId).length;

  const activeCategory = categories.find((c) => c.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Ürünler</h1>
          <p className="text-sm text-zinc-500 mt-1">{products.length} ürün · {categories.length} kategori</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditingKategori(null); setKategoriFormOpen(true); }}
          >
            <Settings2 size={14} className="mr-1" /> Kategori Ekle
          </Button>
          {/* Sipariş & Stok Paneli toggle */}
          <button
            onClick={() => setStokPaneli(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
            style={{
              background: stokPaneli ? "#dcfce7" : "#f4f4f5",
              borderColor: stokPaneli ? "#86efac" : "#e4e4e7",
              color: stokPaneli ? "#15803d" : "#71717a",
            }}
          >
            <span
              className="relative inline-block w-9 h-5 rounded-full transition-colors duration-200"
              style={{ background: stokPaneli ? "#22c55e" : "#d4d4d8" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                style={{ transform: stokPaneli ? "translateX(16px)" : "translateX(0)" }}
              />
            </span>
            Sipariş &amp; Stok Paneli
          </button>
          <Button
            size="sm"
            onClick={() => { setEditingUrun(null); setUrunFormOpen(true); }}
            >

            <Plus size={14} className="mr-1" /> Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
        >
          Tümü ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("ozel-tasarim")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "ozel-tasarim" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
        >
          Özel Tasarım ({customProducts.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === cat.id
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <span className="font-mono text-[11px] opacity-60 font-semibold">{cat.id}</span>
            <span>{cat.name}</span>
            <span className="text-[11px] opacity-50 font-normal">({totalByCategory(cat.id)})</span>
          </button>
        ))}
      </div>

      {/* Arama & Filtre */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ürün adı veya SKU ara..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(statusMap).map(([id, s]) => (
            <option key={id} value={id}>{s.name}</option>
          ))}
        </select>
        <select
          value={filterChannel}
          onChange={e => setFilterChannel(e.target.value)}
          className="text-sm rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <option value="">Tüm Kanallar</option>
          {Object.entries(channelMap).map(([id, c]) => (
            <option key={id} value={id}>{c.name}</option>
          ))}
        </select>
        {allSub1.length > 0 && (
          <select
            value={filterSub1}
            onChange={e => setFilterSub1(e.target.value)}
            className="text-sm rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            <option value="">Tüm Alt Kategoriler</option>
            {allSub1.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterStatus(""); setFilterChannel(""); setFilterSub1(""); }}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded-md border border-zinc-200 bg-white"
          >
            <X size={12} /> Temizle
          </button>
        )}
        <span className="text-xs text-zinc-400 ml-auto">{filteredProducts.length} sonuç</span>
      </div>

      {/* Kategori işlem satırı */}
      {activeTab !== "all" && activeTab !== "ozel-tasarim" && activeCategory && (
        <div className="flex items-center gap-2 -mt-3">
          <span className="text-xs text-zinc-400">Kategori:</span>
          <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
            {activeCategory.id}
          </span>
          <span className="text-xs font-medium text-zinc-800 -ml-1">
            {activeCategory.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs ml-1"
            onClick={() => { setEditingKategori(activeCategory); setKategoriFormOpen(true); }}
          >
            <Pencil size={12} className="mr-1" /> Düzenle
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAyarlarOpen(true)}>
            Ayarlar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-500 hover:text-red-600"
            onClick={() => deleteCategory(activeTab)}
          >
            <Trash2 size={12} className="mr-1" /> Sil
          </Button>
        </div>
      )}

      {/* İçerik */}
      {loading ? (
        <p className="text-sm text-zinc-400 py-8 text-center">Yükleniyor...</p>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-zinc-400 text-sm">
            Bu kategoride henüz ürün yok.
            <br />
            <button
              className="mt-2 text-zinc-700 underline"
              onClick={() => { setEditingUrun(null); setUrunFormOpen(true); }}
            >
              İlk ürünü ekle
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="w-16 px-3 py-2.5 text-center text-xs font-medium text-zinc-500">Görsel</th>
                {([["id", "SKU"], ["name", "Ürün Adı"]] as [typeof sortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 cursor-pointer select-none hover:text-zinc-800"
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-1">{label}<SortIcon field={field} /></span>
                  </th>
                ))}
                {!stokPaneli && ([
                  ["categoryId", "Kategori"],
                  ["subCategory1", "Alt Kat. 1"],
                  ["subCategory2", "Alt Kat. 2"],
                ] as [typeof sortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 cursor-pointer select-none hover:text-zinc-800"
                    onClick={() => handleSort(field)}
                  >
                    <span className="flex items-center gap-1">{label}<SortIcon field={field} /></span>
                  </th>
                ))}
                {stokPaneli && BOYUTLAR.map(b => (
                  <th key={b} className="text-center px-3 py-2.5 text-xs font-medium text-zinc-500 whitespace-nowrap">{b}</th>
                ))}
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500">Kanallar</th>
                <th
                  className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 cursor-pointer select-none hover:text-zinc-800"
                  onClick={() => handleSort("status")}
                >
                  <span className="flex items-center gap-1">Durum<SortIcon field="status" /></span>
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map(({ product }) => {
                const channels: string[] = product.channels ? JSON.parse(product.channels) : [];
                return (
                  <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-3 py-2 text-center align-middle" style={{ width: "70px", minWidth: "70px" }}>
                      {product.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setModalViewMode("a4");
                            setModalZoom(1.65);
                            setPreviewImage({ url: product.imageUrl!, title: product.name, sku: product.id });
                          }}
                          className="relative group inline-block mx-auto cursor-pointer focus:outline-none"
                          title="Büyütmek için tıklayın"
                          style={{ width: "44px", height: "62px" }}
                        >
                          <div
                            className="rounded-lg overflow-hidden border border-zinc-200/90 bg-zinc-100 shadow-xs group-hover:ring-2 group-hover:ring-zinc-400 group-hover:scale-105 transition-all duration-150 flex items-center justify-center mx-auto"
                            style={{ width: "44px", height: "62px", minWidth: "44px", minHeight: "62px", maxWidth: "44px", maxHeight: "62px", position: "relative", overflow: "hidden" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{ width: "44px", height: "62px", minWidth: "44px", minHeight: "62px", maxWidth: "44px", maxHeight: "62px", objectFit: "cover", objectPosition: "center", transform: "scale(1.65)", transformOrigin: "center", display: "block" }}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        </button>
                      ) : (
                        <div
                          className="mx-auto rounded-lg border border-dashed border-zinc-200 bg-zinc-50/70 flex flex-col items-center justify-center text-zinc-300 gap-0.5"
                          style={{ width: "44px", height: "62px", minWidth: "44px", minHeight: "62px", maxWidth: "44px", maxHeight: "62px" }}
                          title="Görsel yok"
                        >
                          <ImageIcon size={15} className="text-zinc-300" />
                          <span className="text-[8px] font-semibold text-zinc-400 font-mono">A4</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {product.id}
                      {product.isCustom === 1 && <span className="ml-1 text-purple-500">-9</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
                    {!stokPaneli && (
                      <>
                        <td className="px-4 py-3 text-xs text-zinc-600">
                          {(() => {
                            const cat = categories.find((c) => c.id === product.categoryId);
                            if (!cat) return <span className="font-mono text-zinc-400">{product.categoryId || "—"}</span>;
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/80 leading-none">
                                  {cat.id}
                                </span>
                                <span className="font-medium text-zinc-800">{cat.name}</span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          {product.subCategory1 && (() => { const c = strToColor(product.subCategory1!); return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: c.bg, color: c.text }}>{product.subCategory1}</span>; })()}
                        </td>
                        <td className="px-4 py-3">
                          {product.subCategory2 && (() => { const c = strToColor(product.subCategory2!); return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: c.bg, color: c.text }}>{product.subCategory2}</span>; })()}
                        </td>
                      </>
                    )}
                    {stokPaneli && BOYUTLAR.map(b => {
                      const key = `${product.id}_${b}`;
                      const stok = printStokMap[key] ?? 0;
                      const isEditing = editingStok === key;
                      return (
                        <td key={b} className="px-2 py-2 text-center align-middle w-16">
                          <div className="flex flex-col items-center gap-0.5">
                            {/* Sipariş sayısı (ileride gelecek) */}
                            <span className="text-[10px] text-zinc-400 leading-tight">— sipariş</span>
                            {/* Stok — inline editable */}
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editingVal}
                                onChange={e => setEditingVal(e.target.value)}
                                onBlur={() => {
                                  saveStok(product.id, b, editingVal);
                                  setEditingStok(null);
                                }}
                                onKeyDown={e => {
                                  if (e.key === "Enter") { saveStok(product.id, b, editingVal); setEditingStok(null); }
                                  if (e.key === "Escape") setEditingStok(null);
                                }}
                                className="w-12 text-center text-xs font-semibold border border-zinc-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              />
                            ) : (
                              <button
                                onClick={() => { setEditingStok(key); setEditingVal(String(stok)); }}
                                className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors hover:bg-zinc-100 ${stok === 0 ? "text-zinc-300" : "text-zinc-800"}`}
                                title="Tıkla düzenle"
                              >
                                {stok}
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {channels.map((ch) => {
                          const info = channelMap[ch];
                          return <span key={ch} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: info?.color ?? "#e5e7eb", color: "#374151" }}>{info?.name ?? ch}</span>;
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(() => { const info = statusMap[product.status ?? ""]; return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: info?.color ?? "#e5e7eb", color: "#374151" }}>{info?.name ?? product.status}</span>; })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => { setEditingUrun(product); setUrunFormOpen(true); }}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <UrunForm
        open={urunFormOpen}
        onClose={() => setUrunFormOpen(false)}
        onSaved={fetchAll}
        categories={categories}
        editing={editingUrun}
        defaultCategoryId={activeTab !== "all" ? activeTab : undefined}
      />

      <KategoriForm
        open={kategoriFormOpen}
        onClose={() => setKategoriFormOpen(false)}
        onSaved={fetchAll}
        editing={editingKategori}
      />

      {activeCategory && (
        <AyarlarPanel
          open={ayarlarOpen}
          onClose={() => setAyarlarOpen(false)}
          category={activeCategory}
        />
      )}

      {/* Görsel Büyütme (Lightbox) Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors z-10"
              title="Kapat"
            >
              <X size={16} />
            </button>

            {/* Başlık & SKU */}
            <div className="text-center mb-3 pr-8 pl-2 w-full">
              <h3 className="font-semibold text-sm text-zinc-900 truncate" title={previewImage.title}>
                {previewImage.title}
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">{previewImage.sku}</p>
            </div>

            {/* Görünüm Seçimi (A4 Kırpma vs Tam Resim) */}
            <div className="flex bg-zinc-100 p-0.5 rounded-lg text-xs font-medium mb-3 w-full max-w-[280px]">
              <button
                type="button"
                onClick={() => setModalViewMode("a4")}
                className={`flex-1 py-1 rounded-md transition-all ${
                  modalViewMode === "a4"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                A4 Çerçeve (Kırpılmış)
              </button>
              <button
                type="button"
                onClick={() => setModalViewMode("original")}
                className={`flex-1 py-1 rounded-md transition-all ${
                  modalViewMode === "original"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Tam Mockup
              </button>
            </div>

            {/* Görsel Alanı */}
            {modalViewMode === "a4" ? (
              /* A4 Dikey Kesin Çerçeve (300px × 424px, 1:1.414) */
              <>
                <div
                  className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-inner flex items-center justify-center mx-auto"
                  style={{ width: "300px", height: "424px", minWidth: "300px", minHeight: "424px", maxWidth: "300px", maxHeight: "424px", position: "relative" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage.url}
                    alt={previewImage.title}
                    style={{
                      width: "300px",
                      height: "424px",
                      minWidth: "300px",
                      minHeight: "424px",
                      maxWidth: "300px",
                      maxHeight: "424px",
                      objectFit: "cover",
                      objectPosition: "center",
                      transform: `scale(${modalZoom})`,
                      transformOrigin: "center",
                      transition: "transform 0.15s ease-out",
                      display: "block",
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Yakınlaştırma (Zoom) Butonları */}
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  <span className="text-[10px] text-zinc-400 font-medium mr-0.5">Odak:</span>
                  {[
                    { label: "1x", zoom: 1.0 },
                    { label: "1.3x", zoom: 1.3 },
                    { label: "1.65x (Önerilen)", zoom: 1.65 },
                    { label: "2x", zoom: 2.0 },
                  ].map((z) => (
                    <button
                      key={z.zoom}
                      type="button"
                      onClick={() => setModalZoom(z.zoom)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        modalZoom === z.zoom
                          ? "bg-zinc-800 text-white font-semibold shadow-xs"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Tam Mockup (Kırpmasız) */
              <div
                className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-inner flex items-center justify-center mx-auto"
                style={{ width: "300px", height: "300px", minWidth: "300px", minHeight: "300px", maxWidth: "300px", maxHeight: "300px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Alt Bilgi & Bağlantı */}
            <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
              <span className="text-[11px] text-zinc-400 font-medium">
                {modalViewMode === "a4" ? "A4 Dikey Poster Odaklı" : "Orijinal Mockup"}
              </span>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ExternalLink size={13} />
                Yeni Sekmede Aç
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
