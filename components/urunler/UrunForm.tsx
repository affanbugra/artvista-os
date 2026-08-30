"use client";

import { useState, useEffect } from "react";
import { ImageIcon, X, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatableSelect } from "@/components/ui/creatable-select";
import type { Category, Product, Channel, ProductStatus, SubCategory } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  editing?: Product | null;
  defaultCategoryId?: string;
}

export function UrunForm({ open, onClose, onSaved, categories, editing, defaultCategoryId }: Props) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCat1, setSubCat1] = useState("");
  const [subCat2, setSubCat2] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [availableChannels, setAvailableChannels] = useState<Channel[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<ProductStatus[]>([]);
  const [parents, setParents] = useState<SubCategory[]>([]);
  const [children, setChildren] = useState<SubCategory[]>([]);

  useEffect(() => {
    if (!open) return;
    fetchChannels();
    fetchStatuses();
    const catId = editing?.categoryId ?? defaultCategoryId;
    setName(editing?.name ?? "");
    setSku(editing?.id ?? "");
    setImageUrl(editing?.imageUrl ?? "");
    setCategoryId(catId ?? "");
    setSubCat1(editing?.subCategory1 ?? "");
    setSubCat2(editing?.subCategory2 ?? "");
    setIsCustom(editing?.isCustom === 1);
    setSelectedChannels(editing?.channels ? JSON.parse(editing.channels) : []);
    setStatus(editing?.status ?? "");
    setError("");
    if (catId) fetchParents(catId);
  }, [open, editing, defaultCategoryId]);

  // Alt kat 1 değişince alt kat 2 seçeneklerini yükle
  useEffect(() => {
    if (!subCat1 || !categoryId) { setChildren([]); return; }
    const parent = parents.find((p) => p.name === subCat1);
    if (parent) fetchChildren(parent.id);
    else setChildren([]);
  }, [subCat1, parents, categoryId]);

  async function fetchChannels() { const r = await fetch("/api/channels"); setAvailableChannels(await r.json()); }
  async function fetchStatuses() {
    const r = await fetch("/api/product-statuses");
    const data: ProductStatus[] = await r.json();
    setAvailableStatuses(data);
    if (!editing) setStatus((s) => s || data[0]?.id || "");
  }
  async function fetchParents(catId: string) {
    const r = await fetch(`/api/sub-categories?categoryId=${catId}&parentId=null`);
    setParents(await r.json());
  }
  async function fetchChildren(parentId: string) {
    const r = await fetch(`/api/sub-categories?categoryId=${categoryId}&parentId=${parentId}`);
    setChildren(await r.json());
  }

  async function createParent(name: string): Promise<void> {
    const r = await fetch("/api/sub-categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, parentId: null, name }),
    });
    const created = await r.json();
    setParents((prev) => [...prev, created]);
  }

  async function createChild(name: string): Promise<void> {
    const parent = parents.find((p) => p.name === subCat1);
    if (!parent) return;
    const r = await fetch("/api/sub-categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, parentId: parent.id, name }),
    });
    const created = await r.json();
    setChildren((prev) => [...prev, created]);
  }

  function handleCategoryChange(val: string) {
    setCategoryId(val);
    setSubCat1(""); setSubCat2("");
    fetchParents(val);
    if (!editing && !sku) setSku(`${val}-`);
  }

  function handleSubCat1Change(val: string) {
    setSubCat1(val);
    setSubCat2("");
  }

  async function generateSku() {
    const parent = parents.find((p) => p.name === subCat1);
    const child = children.find((c) => c.name === subCat2);
    const catCode = categoryId;                          // "01"
    const p1Code = parent?.code ?? "00";                 // "01"
    const p2Code = child?.code ?? "000";                 // "001"
    const prefix = `${catCode}-${p1Code}-${p2Code}`;
    const res = await fetch(`/api/products/next-sku?prefix=${prefix}`);
    const data = await res.json();
    setSku(data.sku);
  }

  function toggleChannel(id: string) {
    setSelectedChannels((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const payload = {
      id: sku,
      name,
      categoryId,
      subCategory1: subCat1,
      subCategory2: subCat2,
      isCustom,
      channels: selectedChannels,
      status,
      imageUrl: imageUrl.trim() || null,
    };
    const res = editing
      ? await fetch(`/api/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Hata"); }
    else { onSaved(); onClose(); }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Ürünü Düzenle" : "Yeni Ürün"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1">
            <Label>Ürün Adı</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör: Adamlar - This Is" required autoFocus />
          </div>

          {/* Tasarım Görseli (URL) & A4 Dikey Önizleme */}
          <div className="space-y-1.5 p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
            <Label className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <span className="flex items-center gap-1.5">
                <LinkIcon size={13} className="text-zinc-500" />
                Tasarım Görseli (URL)
              </span>
              <span className="text-zinc-400 font-normal text-[11px]">Trendyol, Shopier vb. resim linki</span>
            </Label>
            <div className="flex gap-3 items-center">
              {/* A4 Dikey Önizleme Kutusu (Oran 1:1.414) */}
              <div
                className="relative rounded-lg border border-dashed border-zinc-300 bg-white overflow-hidden flex items-center justify-center group shadow-xs shrink-0"
                style={{ width: "48px", height: "68px", minWidth: "48px", minHeight: "68px" }}
              >
                {imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Önizleme"
                      className="w-full h-full"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transform: "scale(2.2)", transformOrigin: "center", display: "block" }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-black text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                      title="Görseli Temizle"
                    >
                      <X size={10} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 gap-0.5 p-1 text-center">
                    <ImageIcon size={18} className="text-zinc-300" />
                    <span className="text-[8px] font-semibold leading-none text-zinc-400">A4 Dikey</span>
                  </div>
                )}
              </div>

              {/* URL Giriş Alanı */}
              <div className="flex-1 space-y-1">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../resim.jpg"
                  className="text-xs font-mono h-9 bg-white"
                />
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Resim linkini yapıştırdığınızda solda dikey A4 önizlemesi belirir.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger><SelectValue placeholder="Kategori seç" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.id} — {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Alt Kategori 1</Label>
              <CreatableSelect
                options={parents}
                value={subCat1}
                onChange={handleSubCat1Change}
                onCreateNew={categoryId ? createParent : undefined}
                placeholder={categoryId ? "Seç veya yaz..." : "Önce kategori seç"}
                disabled={!categoryId}
              />
            </div>
            <div className="space-y-1">
              <Label>Alt Kategori 2</Label>
              <CreatableSelect
                options={children}
                value={subCat2}
                onChange={setSubCat2}
                onCreateNew={subCat1 ? createChild : undefined}
                placeholder={subCat1 ? "Seç veya yaz..." : "Önce alt kat. 1 seç"}
                disabled={!subCat1}
              />
            </div>
          </div>

          {/* SKU */}
          <div className="space-y-1">
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="ör: 01-01-001-001" disabled={!!editing} required className="font-mono" />
            {!editing && (
              <button type="button" onClick={generateSku} disabled={!categoryId}
                className="text-xs text-zinc-500 hover:text-zinc-800 disabled:opacity-40 transition-colors">
                ↻ Otomatik oluştur
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isCustom" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="isCustom">Özel Tasarım <span className="text-zinc-400 font-mono text-xs">(-9)</span></Label>
          </div>

          {/* Durum */}
          <div className="space-y-2">
            <Label>Durum</Label>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((s) => (
                <button key={s.id} type="button" onClick={() => setStatus(status === s.id ? "" : s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${status === s.id ? "border-transparent text-zinc-800" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                  style={status === s.id ? { backgroundColor: (s as any).color ?? "#e5e7eb" } : {}}
                >{s.name}</button>
              ))}
            </div>
          </div>

          {/* Kanallar */}
          <div className="space-y-2">
            <Label>Kanallar</Label>
            <div className="flex flex-wrap gap-2">
              {availableChannels.map((ch) => (
                <button key={ch.id} type="button" onClick={() => toggleChannel(ch.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedChannels.includes(ch.id) ? "border-transparent text-zinc-800" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                  style={selectedChannels.includes(ch.id) ? { backgroundColor: (ch as any).color ?? "#e5e7eb" } : {}}
                >{ch.name}</button>
              ))}
            </div>
          </div>


          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
