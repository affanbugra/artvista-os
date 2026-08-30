"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, SubCategory, Channel, ProductStatus } from "@/db/schema";

// ─── Genel Liste (Kanal / Durum) ─────────────────────────────────────────────
function GenelListe({ title, apiBase, idPlaceholder, namePlaceholder }: {
  title: string; apiBase: string; idPlaceholder: string; namePlaceholder: string;
}) {
  const [items, setItems] = useState<(Channel | ProductStatus)[]>([]);
  const [newId, setNewId] = useState(""); const [newName, setNewName] = useState(""); const [newColor, setNewColor] = useState("#e5e7eb");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); const [editName, setEditName] = useState(""); const [editColor, setEditColor] = useState("");

  const load = useCallback(async () => { const r = await fetch(apiBase); setItems(await r.json()); }, [apiBase]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!newId || !newName) return;
    await fetch(apiBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: newId, name: newName, color: newColor }) });
    setNewId(""); setNewName(""); setNewColor("#e5e7eb"); setAdding(false); load();
  }
  async function save(id: string) {
    await fetch(`${apiBase}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, color: editColor }) });
    setEditId(null); load();
  }
  async function del(id: string) {
    if (!confirm(`"${id}" silinsin mi?`)) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" }); load();
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{title}</p>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 p-2 rounded-md border border-zinc-200">
          {editId === item.id ? (
            <>
              <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer p-0 border-0" />
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm" autoFocus />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => save(item.id)}><Check size={13} /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditId(null)}><X size={13} /></Button>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: (item as any).color ?? "#e5e7eb" }} />
              <span className="flex-1 text-sm">{item.name}</span>
              <span className="text-xs text-zinc-400 font-mono">{item.id}</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditId(item.id); setEditName(item.name); setEditColor((item as any).color ?? "#e5e7eb"); }}><Pencil size={13} /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => del(item.id)}><Trash2 size={13} /></Button>
            </>
          )}
        </div>
      ))}
      {adding ? (
        <div className="space-y-2 pt-1">
          <Input placeholder={idPlaceholder} value={newId} onChange={(e) => setNewId(e.target.value)} className="text-sm" />
          <div className="flex gap-2">
            <Input placeholder={namePlaceholder} value={newName} onChange={(e) => setNewName(e.target.value)} className="text-sm" />
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-zinc-200 p-0.5" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={!newId || !newName}>Ekle</Button>
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewId(""); setNewName(""); }}>İptal</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600">
          <Plus size={12} /> Yeni ekle
        </button>
      )}
    </div>
  );
}

// ─── Hiyerarşik Alt Kategori ─────────────────────────────────────────────────
function HiyerarsikAltKat({ category }: { category: Category }) {
  const [parents, setParents] = useState<SubCategory[]>([]);
  const [children, setChildren] = useState<Record<string, SubCategory[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [newParentName, setNewParentName] = useState(""); const [newParentCode, setNewParentCode] = useState(""); const [newParentColor, setNewParentColor] = useState("#e5e7eb"); const [addingParent, setAddingParent] = useState(false);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState(""); const [newChildCode, setNewChildCode] = useState(""); const [newChildColor, setNewChildColor] = useState("#e5e7eb");
  const [editId, setEditId] = useState<string | null>(null); const [editName, setEditName] = useState(""); const [editCode, setEditCode] = useState(""); const [editColor, setEditColor] = useState("");

  const loadParents = useCallback(async () => {
    const r = await fetch(`/api/sub-categories?categoryId=${category.id}&parentId=null`);
    setParents(await r.json());
  }, [category.id]);

  const loadChildren = useCallback(async (parentId: string) => {
    const r = await fetch(`/api/sub-categories?categoryId=${category.id}&parentId=${parentId}`);
    const data = await r.json();
    setChildren((prev) => ({ ...prev, [parentId]: data }));
  }, [category.id]);

  useEffect(() => { loadParents(); }, [loadParents]);

  async function addParent() {
    if (!newParentName || !newParentCode) return;
    await fetch("/api/sub-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: category.id, parentId: null, name: newParentName, code: newParentCode.padStart(2, "0"), color: newParentColor }) });
    setNewParentName(""); setNewParentCode(""); setNewParentColor("#e5e7eb"); setAddingParent(false); loadParents();
  }

  async function addChild(parentId: string) {
    if (!newChildName || !newChildCode) return;
    await fetch("/api/sub-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: category.id, parentId, name: newChildName, code: newChildCode.padStart(3, "0"), color: newChildColor }) });
    setNewChildName(""); setNewChildCode(""); setNewChildColor("#e5e7eb"); setAddingChildOf(null); loadChildren(parentId);
  }

  async function save(id: string, parentId: string | null) {
    await fetch(`/api/sub-categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, code: editCode, color: editColor }) });
    setEditId(null);
    if (parentId) loadChildren(parentId); else loadParents();
  }

  async function del(id: string, parentId: string | null) {
    await fetch(`/api/sub-categories/${id}`, { method: "DELETE" });
    if (parentId) loadChildren(parentId); else { loadParents(); setChildren((prev) => { const n = { ...prev }; delete n[id]; return n; }); }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!children[id]) loadChildren(id);
  }

  const ItemRow = ({ item, parentId }: { item: SubCategory; parentId: string | null }) => (
    <div className="flex items-center gap-2 p-2 rounded-md border border-zinc-200">
      {editId === item.id ? (
        <>
          <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer p-0 border-0" />
          <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} className="h-7 text-sm w-14 font-mono" placeholder="kod" maxLength={3} />
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm flex-1" autoFocus />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => save(item.id, parentId)}><Check size={13} /></Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditId(null)}><X size={13} /></Button>
        </>
      ) : (
        <>
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color ?? "#e5e7eb" }} />
          <span className="font-mono text-xs text-zinc-400 w-8">{item.code}</span>
          <span className="flex-1 text-sm">{item.name}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditId(item.id); setEditName(item.name); setEditCode(item.code ?? ""); setEditColor(item.color ?? "#e5e7eb"); }}><Pencil size={13} /></Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => del(item.id, parentId)}><Trash2 size={13} /></Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Alt Kategoriler</p>
      {parents.map((parent) => (
        <div key={parent.id}>
          <div className="flex items-start gap-1">
            <button type="button" onClick={() => toggleExpand(parent.id)} className="mt-2.5 text-zinc-400 hover:text-zinc-600 flex-shrink-0">
              <ChevronRight size={14} className={`transition-transform ${expanded[parent.id] ? "rotate-90" : ""}`} />
            </button>
            <div className="flex-1"><ItemRow item={parent} parentId={null} /></div>
          </div>

          {expanded[parent.id] && (
            <div className="ml-6 mt-1 space-y-1 border-l-2 border-zinc-100 pl-3">
              {(children[parent.id] ?? []).map((child) => (
                <ItemRow key={child.id} item={child} parentId={parent.id} />
              ))}
              {addingChildOf === parent.id ? (
                <div className="flex gap-2 items-center py-1">
                  <input type="color" value={newChildColor} onChange={(e) => setNewChildColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-zinc-200 p-0.5 flex-shrink-0" />
                  <Input placeholder="001" value={newChildCode} onChange={(e) => setNewChildCode(e.target.value)} className="text-sm h-7 w-14 font-mono" maxLength={3} />
                  <Input placeholder="Alt seçenek adı" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} className="text-sm h-7" autoFocus />
                  <Button size="sm" className="h-7 text-xs" onClick={() => addChild(parent.id)} disabled={!newChildName || !newChildCode}>Ekle</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setAddingChildOf(null); setNewChildName(""); setNewChildCode(""); }}>İptal</Button>
                </div>
              ) : (
                <button onClick={() => { setAddingChildOf(parent.id); setNewChildName(""); }} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-500 py-1">
                  <Plus size={11} /> Alt seçenek ekle
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {addingParent ? (
        <div className="flex gap-2 items-center">
          <input type="color" value={newParentColor} onChange={(e) => setNewParentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0.5 flex-shrink-0" />
          <Input placeholder="01" value={newParentCode} onChange={(e) => setNewParentCode(e.target.value)} className="text-sm h-8 w-14 font-mono" maxLength={2} />
          <Input placeholder="Ana seçenek adı" value={newParentName} onChange={(e) => setNewParentName(e.target.value)} className="text-sm h-8" autoFocus />
          <Button size="sm" className="h-8" onClick={addParent} disabled={!newParentName || !newParentCode}>Ekle</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => { setAddingParent(false); setNewParentName(""); setNewParentCode(""); }}>İptal</Button>
        </div>
      ) : (
        <button onClick={() => setAddingParent(true)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600">
          <Plus size={12} /> Ana seçenek ekle
        </button>
      )}
    </div>
  );
}

// ─── Ana Panel ────────────────────────────────────────────────────────────────
const TABS = ["Alt Kategoriler", "Kanallar", "Durum"] as const;

interface Props { open: boolean; onClose: () => void; category: Category; }

export function AyarlarPanel({ open, onClose, category }: Props) {
  const [tab, setTab] = useState<typeof TABS[number]>("Alt Kategoriler");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Ayarlar</span>
            <span className="text-zinc-300 font-normal">—</span>
            <span className="font-mono text-xs bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200">{category.id}</span>
            <span>{category.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tab === "Alt Kategoriler" && <HiyerarsikAltKat category={category} />}
          {tab === "Kanallar" && <GenelListe title="Kanallar (tüm kategoriler için)" apiBase="/api/channels" idPlaceholder="ör: shopier" namePlaceholder="ör: Shopier" />}
          {tab === "Durum" && <GenelListe title="Durum seçenekleri (tüm kategoriler için)" apiBase="/api/product-statuses" idPlaceholder="ör: arsiv" namePlaceholder="ör: Arşiv" />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
