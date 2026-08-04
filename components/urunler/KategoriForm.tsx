"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Category | null;
}

export function KategoriForm({ open, onClose, onSaved, editing }: Props) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setId(editing?.id ?? "");
      setName(editing?.name ?? "");
      setError("");
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let res: Response;

      if (editing && id !== editing.id) {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name }),
        });
        if (res.ok) {
          await fetch(`/api/categories/${editing.id}`, { method: "DELETE" });
        }
      } else if (editing) {
        res = await fetch(`/api/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Hata oluştu");
      } else {
        onSaved();
        onClose();
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Kod (2 haneli)</Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ör: 10"
              maxLength={2}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Kategori Adı</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ör: Spor"
              required
              autoFocus={!!editing}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
