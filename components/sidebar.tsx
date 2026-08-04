"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Image as ImageIcon,
  TrendingUp,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// enabled: false → soluk görünür, tıklanmaz. Modül hazır olunca true yap.
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: false },
  { href: "/siparisler", label: "Siparişler", icon: ShoppingCart, enabled: false },
  { href: "/stok", label: "Stok", icon: Package, enabled: false },
  { href: "/urunler", label: "Ürünler", icon: ImageIcon, enabled: true },
  { href: "/finans", label: "Finans", icon: TrendingUp, enabled: false },
  { href: "/etkinlikler", label: "Etkinlikler", icon: CalendarDays, enabled: false },
  { href: "/reklamlar", label: "Reklamlar", icon: Megaphone, enabled: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-zinc-900 text-zinc-100 flex flex-col border-r border-zinc-800">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="ArtVista Logo"
          width={160}
          height={60}
          className="object-contain invert"
          priority
        />
        <p className="text-xs text-zinc-400 mt-1.5">Yönetim Paneli</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, enabled }) => {
          const active = pathname.startsWith(href);

          if (!enabled) {
            return (
              <div
                key={href}
                aria-disabled="true"
                title="Bu modül henüz aktif değil"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-600 opacity-40 cursor-not-allowed select-none"
              >
                <Icon size={16} />
                {label}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-zinc-700 text-white font-medium"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-zinc-800 text-xs text-zinc-500">
        v1.0 MVP
      </div>
    </aside>
  );
}
