import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, TrendingUp, Clock } from "lucide-react";

const kpiCards = [
  { title: "Toplam Satış", value: "₺0", desc: "Tüm zamanlar", icon: TrendingUp },
  { title: "Aktif Sipariş", value: "0", desc: "Beklemede & hazırlanıyor", icon: Clock },
  { title: "Toplam Sipariş", value: "0", desc: "Tüm kanallar", icon: ShoppingCart },
  { title: "Stok Uyarısı", value: "0", desc: "Düşük stok kalemi", icon: Package },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">ArtVista Poster Türkiye — Genel Bakış</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ title, value, desc, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">{title}</CardTitle>
              <Icon size={16} className="text-zinc-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-900">{value}</p>
              <p className="text-xs text-zinc-400 mt-1">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Son Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">
            Henüz sipariş yok. Siparişler modülü FAZ 3&apos;te gelecek.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
