# ArtVista OS 🎨

> **ArtVista Poster Türkiye** için geliştirilmiş çok kanallı e-ticaret, atölye üretim ve operasyon yönetim sistemi.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Turso](https://img.shields.io/badge/Database-Turso_(libSQL)-00E699?style=flat-square&logo=sqlite)](https://turso.tech/)
[![Auth.js](https://img.shields.io/badge/Auth-NextAuth_v5-purple?style=flat-square&logo=auth0)](https://authjs.dev/)

---

## 📌 Proje Özeti & Çözülen Problem

ArtVista; Trendyol, Shopier, fiziksel stantlar ve özel siparişler üzerinden poster ve çerçeve satışı yapan bir e-ticaret markasıdır. 

Farklı pazaryerlerinden gelen siparişlerin, farklı boyutlardaki (15x21, 21x30, 30x42, 42x60) baskı ve çerçeve maliyetlerinin, komisyon oranlarının ve stok hareketlerinin Excel üzerinden takibi zamanla operasyonel karmaşaya yol açar.

**ArtVista OS**, tüm bu süreçleri tek bir çatı altında toplayarak:
* Ürün kataloglarını ve hiyerarşik alt kategorileri standartlaştırır.
* Akıllı algoritmayla kategori ve varyant bazlı **otomatik SKU** üretir (`02-01-001-007`).
* Trendyol/Shopier mockup görsellerini doğrudan **A4 dikey oranında** listeleyip önizler.
* Boyut ve kanal bazlı net kâr / maliyet hesaplamalarını otomatikleştirir.

---

## 🚀 Modül Durumu

### 🟢 Aktif Modüller (Canlıda)

#### 1. Ürün & Katalog Yönetimi (`/urunler`)
* **Hiyerarşik Kategori & Kodlama:** 2 haneli ana kategori kodları (`01 Müzik`, `02 Dizi-Film` vb.), 2 haneli Alt Kategori 1 ve 3 haneli Alt Kategori 2 mimarisi.
* **Otomatik SKU Üretici:** Kategori ve alt kategori seçimlerine göre sistem otomatik olarak benzersiz SKU üretir.
* **Akıllı A4 Tasarım Önizleme & Lightbox:** Harici görsel linklerini (Trendyol CDN vb.) otomatik olarak ortalayarak A4 dikey orana odaklayan akıllı kırpma ve zoom motoru.
* **Hızlı Durum & Kanal Etiketleme:** Ürünün hangi satış kanallarında (Shopier, Trendyol, Stant) aktif olduğunu ve satış durumunu tek tıkla yönetme.

#### 2. Baskı & Çerçeve Stok Takip Modülü
* 4 farklı standart poster boyutu (`15x21`, `21x30`, `30x42`, `42x60`) için anlık stok miktarlarını tablo üzerinden inline düzenleme.
* Çerçeve renkleri (Ahşap, Siyah, Beyaz) ve defolu ürün takibi.

#### 3. Fiyatlandırma & Kâr Şablonları
* Kanal bazlı komisyon oranları, kargo maliyetleri, stopaj ve paketleme giderlerini otomatik hesaplayarak net kâr marjını çıkaran dinamik hesaplama motoru.

---

### 🟡 Yakında Eklenecek Modüller (Roadmap)

* [ ] **Sipariş Yönetimi (`/siparisler`):** Pazaryeri siparişlerinin tek ekranda toplanması, atölye hazırlık aşamaları (Basıldı, Çerçevelendi, Kargolandı) ve kargo takip entegrasyonu.
* [ ] **Finans & Muhasebe (`/finans`):** Günlük/aylık net ciro, platform komisyon kesintileri, malzeme alımları ve kâr analiz raporları.
* [ ] **Etkinlik & Stant Operasyonu (`/etkinlikler`):** Festival ve stant satışlarında personel maliyeti, stant kirası ve anlık tahsilat takibi.
* [ ] **Reklam Analitiği (`/reklamlar`):** Meta & Trendyol reklam harcamaları ile sipariş dönüşüm (ROAS) korelasyonu.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Frontend & SSR** | Next.js 14 (App Router) | React Server Components & Hızlı İstemci Yönlendirmesi |
| **Stil & UI** | Tailwind CSS & Radix UI | Şık, modern, erişilebilir bileşen mimarisi |
| **Veritabanı & ORM** | Turso (libSQL) & Drizzle ORM | Edge uyumlu, sunucusuz SQLite veritabanı |
| **Kimlik Doğrulama** | NextAuth.js (v5 Beta) | Google OAuth + E-posta Beyaz Listesi (Whitelist) |
| **Dağıtım (Hosting)** | Vercel | Global CDN & Serverless Edge Functions |

---

## 🔒 Güvenlik & Yetkilendirme

* **Next.js Middleware Guard:** Yetkisiz kullanıcıların API uç noktalarına veya sayfalara erişmesi engellenir.
* **E-posta Beyaz Listesi:** Yalnızca tanımlı e-posta adresleri sisteme Google ile giriş yapabilir.
* **Sıfır Secret Sızıntısı:** Tüm hassas anahtarlar Vercel Ortam Değişkenlerinde saklanır.

---

## 💻 Lokal Kurulum & Geliştirme

```bash
# 1. Depoyu klonlayın
git clone https://github.com/affanbugra/artvista-os.git
cd artvista-os

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

*Tarayıcınızda `http://localhost:3000/urunler` adresine giderek paneli inceleyebilirsiniz.*

---

## 📄 Lisans

Bu proje **ArtVista Poster Türkiye** için özel olarak geliştirilmiştir. Tüm hakları saklıdır.
