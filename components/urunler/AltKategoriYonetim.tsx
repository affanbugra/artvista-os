"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, SubCategory } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  category: Category;
}

function SubCatList({ categoryId, level, label }: { categoryId: string; level: number; label: string }) {
  const [items, setItems] = useState<SubCategory[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#e5e7eb");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  async function load() {
    const res = await fetch(`/api/sub-categories?categoryId=${categoryId}&level=${level}`);
    setItems(await res.json());
  }

  useEffect(() => { load(); }, [categoryId, level]);

  async function add() {
    if (!newName) return;
    await fetch("/api/sub-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, level, name: newName, color: newColor }),
    });
    setNewName(""); setNewColor("#e5e7eb"); setAdding(false);
    load();
  }

  async function save(id: string) {
    await fetch(`/api/sub-categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    setEditingId(null);
    load();
  }

  async function del(id: string) {
    await fetch(`/api/sub-categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 p-2 rounded-md border border-zinc-200">
          {editingId === item.id ? (
            <>
              <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm" autoFocus />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => save(item.id)}><Check size={13} /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}><X size={13} /></Button>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color ?? "#e5e7eb" }} />
              <span className="flex-1 text-sm">{item.name}</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(item.id); setEditName(item.name); setEditColor(item.color ?? "#e5e7eb"); }}><Pencil size={13} /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => del(item.id)}><Trash2 size={13} /></Button>
            </>
          )}
        </div>
      ))}
      {items.length === 0 && !adding && <p className="text-xs text-zinc-400 py-1">Henüz seçenek yok</p>}
      {adding ? (
        <div className="flex gap-2 items-center">
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0.5 flex-shrink-0" />
          <Input placeholder="Seçenek adı" value={newName} onChange={(e) => setNewName(e.target.value)} className="text-sm h-8" autoFocus onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button size="sm" className="h-8" onClick={add} disabled={!newName}>Ekle</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => { setAdding(false); setNewName(""); }}>İptal</Button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          <Plus size={12} /> Yeni ekle
        </button>
      )}
    </div>
  );
}

export function AltKategoriYonetim({ open, onClose, category }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category.name} — Alt Kategoriler</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <SubCatList categoryId={category.id} level={1} label="Alt Kategori 1" />
          <div className="border-t" />
          <SubCatList categoryId={category.id} level={2} label="Alt Kategori 2" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
