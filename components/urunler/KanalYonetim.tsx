"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Channel } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  channels: Channel[];
  onChanged: () => void;
}

export function KanalYonetim({ open, onClose, channels, onChanged }: Props) {
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function addChannel() {
    if (!newId || !newName) return;
    await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name: newName }),
    });
    setNewId(""); setNewName(""); setAdding(false);
    onChanged();
  }

  async function saveEdit(id: string) {
    await fetch(`/api/channels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    onChanged();
  }

  async function deleteChannel(id: string) {
    if (!confirm(`"${id}" kanalını silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/channels/${id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Kanal Yönetimi</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {channels.map((ch) => (
            <div key={ch.id} className="flex items-center gap-2 p-2 rounded-md border border-zinc-200">
              {editingId === ch.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600" onClick={() => saveEdit(ch.id)}>
                    <Check size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                    <X size={13} />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{ch.name}</span>
                  <span className="text-xs text-zinc-400 font-mono">{ch.id}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingId(ch.id); setEditName(ch.name); }}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => deleteChannel(ch.id)}>
                    <Trash2 size={13} />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        {adding ? (
          <div className="space-y-2 border-t pt-3">
            <Input placeholder="Kanal ID (ör: shopier)" value={newId} onChange={(e) => setNewId(e.target.value)} className="text-sm" />
            <Input placeholder="Görünen Ad (ör: Shopier)" value={newName} onChange={(e) => setNewName(e.target.value)} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" onClick={addChannel} disabled={!newId || !newName}>Ekle</Button>
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewId(""); setNewName(""); }}>İptal</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setAdding(true)}>
            <Plus size={13} className="mr-1" /> Yeni Kanal
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
