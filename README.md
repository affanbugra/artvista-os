# ArtVista OS 🎨
> **Kendi e-ticaret markam (ArtVista) için geliştirdiğim Trendyol ürün, katalog ve atölye stok yönetim paneli.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Turso](https://img.shields.io/badge/Database-Turso_(SQLite)-00E699?style=flat-square&logo=sqlite)](https://turso.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 💡 Neden Bu Paneli Geliştirdim?

Trendyol üzerinde poster ve çerçeve satışı yaparken ürün çeşitliliği arttıkça Excel tabloları ve standart paneller operasyonu yavaşlatmaya başladı. 

Farklı boyutlardaki (15x21, 21x30, 30x42, 42x60) baskı maliyetleri, 3 farklı çerçeve rengi (Ahşap, Siyah, Beyaz), karmaşıklaşan SKU kodları ve telif/arşiv takipleri gibi işleri hızlandırmak ve günlük operasyonumu optimize etmek için bu paneli sıfırdan inşa ettim.

---

## ⚡ Neler Yapıyor?

* **🏷️ Otomatik SKU & Hiyerarşik Kodlama:** Kategori ve alt varyantları seçtiğim an sisteme özel benzersiz SKU formatını (`02-01-001-007`) otomatik üretir.
* **🖼️ Akıllı A4 Tasarım Görsel Motoru:** Trendyol'daki oda/mockup görsel linkini yapıştırdığımda sistem otomatik olarak merkeze odaklanıp A4 dikey oranda postere zoom yapar.
* **🔍 Trendyol Satış Teyit Mekanizması:** Her ürünün 3 çerçeve rengi varyantını hesaba katarak Trendyol'da satışta olması gereken aktif ilan sayısını hesaplar; böylece telife uğrayan veya arşive alınan ürünleri anında yakalarım.
* **📦 Anlık Baskı & Çerçeve Stok Takibi:** 4 farklı boyut için baskı ve çerçeve stoklarını tek tablodan saniyeler içinde güncellerim.

---

## 🚀 Sırada Ne Var?

* [ ] Trendyol API ile otomatik sipariş çekme
* [ ] Atölye hazırlık aşamaları (Basıldı, Çerçevelendi, Kargolandı)
* [ ] Kargo takip ve otomatik faturalandırma

---

## 🛠️ Teknolojiler

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · Turso (libSQL/SQLite) · NextAuth.js · Vercel

