import { redirect } from "next/navigation";

// Giriş sayfası şimdilik Ürünler. Diğer modüller FAZ 2+ ile açılacak.
export default function HomePage() {
  redirect("/urunler");
}
