"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Item { id: string; name: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  items: Item[];
  apiBase: string; // "/api/channels" veya "/api/product-statuses"
  idPlaceholder?: string;
  namePlaceholder?: string;
  onChanged: () => void;
}

export function SecenekYonetim({ open, onClose, title, items, apiBase, idPlaceholder = "ör: shopier", namePlaceholder = "ör: Shopier", onChanged }: Props) {
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#e5e7eb");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#e5e7eb");

  async function addItem() {
    if (!newId || !newName) return;
    await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name: newName, color: newColor }),
    });
    setNewId(""); setNewName(""); setNewColor("#e5e7eb"); setAdding(false);
    onChanged();
  }

  async function saveEdit(id: string) {
    await fetch(`${apiBase}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    setEditingId(null);
    onChanged();
  }

  async function deleteItem(id: string) {
    if (!confirm(`"${id}" silinsin mi?`)) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-md border border-zinc-200">
              {editingId === item.id ? (
                <>
                  <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm" autoFocus />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => saveEdit(item.id)}><Check size={13} /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}><X size={13} /></Button>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: (item as any).color ?? "#e5e7eb" }} />
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-zinc-400 font-mono">{item.id}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(item.id); setEditName(item.name); setEditColor((item as any).color ?? "#e5e7eb"); }}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => deleteItem(item.id)}><Trash2 size={13} /></Button>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-zinc-400 text-center py-2">Henüz seçenek yok</p>}
        </div>

        {adding ? (
          <div className="space-y-2 border-t pt-3">
            <Input placeholder={idPlaceholder} value={newId} onChange={(e) => setNewId(e.target.value)} className="text-sm" />
            <div className="flex gap-2">
              <Input placeholder={namePlaceholder} value={newName} onChange={(e) => setNewName(e.target.value)} className="text-sm" />
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-zinc-200 p-0.5" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addItem} disabled={!newId || !newName}>Ekle</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewId(""); setNewName(""); }}>İptal</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setAdding(true)}>
            <Plus size={13} className="mr-1" /> Yeni Ekle
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
