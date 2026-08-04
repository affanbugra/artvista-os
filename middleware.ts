import { NextResponse } from "next/server";
import { auth, AUTH_ENABLED } from "@/auth";

// Şu an sadece Ürünler modülü açık. Yeni modül açıldıkça buraya ekle
// ve components/sidebar.tsx içinde enabled: true yap.
const OPEN_ROUTES = ["/urunler"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Auth.js kendi uçları her zaman serbest
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const signedIn = !AUTH_ENABLED || Boolean(req.auth);

  // API: girişsiz erişimde 401, rota kilidi uygulanmaz
  if (pathname.startsWith("/api")) {
    return signedIn
      ? NextResponse.next()
      : NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  // Giriş sayfası
  if (pathname === "/giris") {
    return signedIn && AUTH_ENABLED
      ? NextResponse.redirect(new URL("/urunler", req.nextUrl))
      : NextResponse.next();
  }
  if (!signedIn) {
    return NextResponse.redirect(new URL("/giris", req.nextUrl));
  }

  // Kapalı modüllere URL'den de girilemesin
  const allowed = OPEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (!allowed) {
    return NextResponse.redirect(new URL("/urunler", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Statik dosyalar ve Next.js iç yolları hariç her istek
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
