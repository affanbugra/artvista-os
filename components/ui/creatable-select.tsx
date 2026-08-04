"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

interface Option { id: string; name: string; color?: string | null; }

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onCreateNew?: (name: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function CreatableSelect({ options, value, onChange, onCreateNew, placeholder = "Seç...", disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));
  const exactMatch = options.some((o) => o.name.toLowerCase() === query.toLowerCase());
  const selected = options.find((o) => o.name === value);

  async function handleCreate() {
    if (!query || !onCreateNew) return;
    await onCreateNew(query);
    onChange(query);
    setQuery("");
    setOpen(false);
  }

  function handleSelect(opt: Option) {
    onChange(opt.name);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange("");
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className="w-full flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-left shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-zinc-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: selected.color ?? "#e5e7eb" }} />
              {selected.name}
            </>
          ) : (
            <span className="text-zinc-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={14} className="text-zinc-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg">
          <div className="p-1.5 border-b border-zinc-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara veya yeni yaz..."
              className="w-full text-sm outline-none px-2 py-1"
              onKeyDown={(e) => { if (e.key === "Enter" && !exactMatch && query) handleCreate(); if (e.key === "Escape") setOpen(false); }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {value && (
              <button type="button" onClick={handleClear} className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-50">
                — Seçimi kaldır
              </button>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-zinc-50 text-left"
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color ?? "#e5e7eb" }} />
                {opt.name}
                {opt.name === value && <Check size={12} className="ml-auto text-zinc-500" />}
              </button>
            ))}
            {query && !exactMatch && onCreateNew && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 border-t border-zinc-100"
              >
                <Plus size={13} className="text-zinc-400" />
                <span>Yeni ekle: <strong>{query}</strong></span>
              </button>
            )}
            {filtered.length === 0 && !query && (
              <p className="px-3 py-2 text-xs text-zinc-400">Henüz seçenek yok</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
