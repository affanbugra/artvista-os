# 🖼️ ArtVista OS — Master Plan v3.0

> **Tek kaynak (single source of truth).** Teknik mimari, veri modeli, faz yol haritası ve güncel ilerleme durumu bu dosyada.
> Kapsam: sadece Türkiye operasyonu. Etsy, POD, ABD kapsam dışı.

---

## 🚀 Hızlı Başlangıç (Yeni Sohbet)

```bash
cd "/d/Masaüstü/OneDrive/Coding/Claude Code/ArtVista Projesi/artvista-os"
npm run dev
# Port 3000-3004 arası değişebilir, terminale bak
```

---

## 📌 1. Proje Özeti

| Alan | Detay |
|---|---|
| **Proje Adı** | ArtVista OS |
| **Versiyon** | 1.0 (MVP) |
| **Çalışma Modu** | Lokal-first → Vercel deploy |
| **Auth** | Yok (MVP'de tek kullanıcı) |
| **Arayüz Dili** | Türkçe |
| **Para Birimi** | TRY |
| **Konum** | `D:\Masaüstü\OneDrive\Coding\Claude Code\ArtVista Projesi\artvista-os` |

---

## 🏪 2. İş Modeli & Satış Kanalları

| Kanal | Tür | Fulfillment | Komisyon |
|---|---|---|---|
| **Shopier** | Web sitesi | Kendi kargo (MNG, Geliver) | ~%5.99 + 0.5 TL |
| **Trendyol** | Marketplace | Kendi kargo | ~%20 + Hizmet bed. |
| **Stant / Etkinlik** | Fiziksel | Elden teslim | Yok |
| **Elden** | Direkt satış | Elden teslim | Yok |

**Sipariş Tipleri:** Fiziksel (baskı + opsiyonel çerçeve + kargo) | Elden (stant veya direkt)

---

## 🗂️ 3. SKU Sistemi

```
KATEGORİ - ALT_KAT_1 - ALT_KAT_2 - ÜRÜN_NO
   01     -    01     -    001    -   002
```

- **Alt Kat 1 kodu:** 2 haneli (örn: `01`)
- **Alt Kat 2 kodu:** 3 haneli (örn: `001`)
- **Özel Tasarım suffix:** SKU sonuna `-9` → `01-01-001-001-9`
- **Otomatik SKU:** Formda "↻ Otomatik oluştur" butonu, aynı prefix'teki son SKU'nun +1'i
- Örnek: `01-01-001-002` → Müzik / This Is / Adamlar / 2. varyant

---

## 🗄️ 4. Veri Modeli

**Teknoloji:** SQLite (lokal) → PostgreSQL/Supabase (production) | **ORM:** Drizzle ORM

### Mevcut Tablolar (schema.ts'e bakın)

| Tablo | Açıklama | Notlar |
|---|---|---|
| `categories` | Kategori kodları (00-99) | id, name, slug, sort_order, is_active |
| `sub_categories` | Hiyerarşik alt kategoriler | parent_id (null=üst), code, name, color |
| `channels` | Satış kanalları | Dinamik, renkli, DB'den yönetilir |
| `product_statuses` | Ürün durumları | Dinamik, renkli (Satışta/Pasif/Telif) |
| `products` | Ürün kataloğu | SKU primary key, is_custom flag |
| `price_templates` | Kanal × boyut fiyat şablonları | Seed edildi |
| `frame_stock` | Çerçeve stok (4 boyut × 3 renk) | Seed edildi |
| `print_stock` | Hazır baskı stok | |
| `supplies` | Sarf malzemeleri | Seed edildi |
| `stock_movements` | Stok hareket logu | |
| `orders` | Siparişler | |
| `order_items` | Sipariş kalemleri | |
| `expenses` | Giderler | |
| `events` | Fiziksel etkinlikler/stant | |

### Önemli Schema Notları
- `sub_categories.parent_id = null` → Alt Kat 1 (2 haneli code)
- `sub_categories.parent_id = <id>` → Alt Kat 2 (3 haneli code)
- `products.channels` → JSON array string: `["trendyol","shopier"]`
- `products.status` → `product_statuses.id` referansı (artık dinamik)

---

## 🏗️ 5. Teknik Mimari

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 14 (App Router) |
| Veritabanı | SQLite → PostgreSQL |
| ORM | Drizzle ORM |
| Stil | Tailwind CSS + shadcn/ui |
| Grafikler | Recharts |
| İkonlar | Lucide React |

### Kritik Dosyalar
- `db/schema.ts` — tüm tablo tanımları
- `db/seed.ts` — başlangıç verileri
- `lib/db.ts` — DB bağlantısı
- `app/api/` — tüm API route'ları
- `components/urunler/` — UrunForm, KategoriForm, AyarlarPanel
- `components/ui/creatable-select.tsx` — özel combobox
- `app/urunler/page.tsx` — ana ürünler sayfası

### Stok Düşme Mantığı (FAZ 3'te devreye girer)
```
Sipariş Kaydet
→ has_frame=1 varsa: frame_stock[size][color] -= quantity
→ use_stock_print=1 varsa: print_stock[product_id][size] -= quantity
→ Stok < 0 ise: toast uyarı ver ama engelleme
```

---

## 🗺️ 6. Faz Yol Haritası & Güncel Durum

### ✅ FAZ 0 — Proje Altyapısı — TAMAMLANDI
- Next.js + shadcn/ui + Drizzle kuruldu
- Tüm DB tabloları oluşturuldu, seed çalıştırıldı
- Sidebar layout hazır

---

### ✅ FAZ 1 — Ürün Kataloğu — BÜYÜK ÖLÇÜDE TAMAMLANDI

**Yapılanlar:**
- [x] Kategori CRUD (kod + isim düzenlenebilir, koda göre sıralı)
- [x] Hiyerarşik alt kategoriler (parent_id, code, renk, kategori bazlı)
- [x] Ayarlar paneli: Alt Kategoriler + Kanallar + Durum tek yerde
- [x] Dinamik kanallar (DB'den, renkli)
- [x] Dinamik durum (DB'den, renkli, toggle — tekrar tıklayınca deselect)
- [x] Ürün CRUD (ekle/düzenle/sil)
- [x] Otomatik SKU üretimi (`XX-XX-XXX-XXX` formatı, sıradakini bulur)
- [x] Özel Tasarım: checkbox + ayrı filtre sekmesi
- [x] Kategori sekmesinde ürün ekleyince o kategori otomatik seçili
- [x] Renkli badge'ler (kanal, durum, alt kategori)
- [x] Kategori + Alt Kat 1 + Alt Kat 2 sütunları tabloda

**Kalan Eksikler:**
- [ ] Ürün listesinde **stok sayısı** sütunu (print_stock toplamı)
- [ ] Ürün listesinde **toplam sipariş sayısı** sütunu (order_items toplamı)
- [ ] Ürün listesinde **arama/filtreleme** (duruma, kanala, ada göre)

---

### ⏳ FAZ 2 — Stok Yönetimi — BAŞLANMADI

- [ ] Çerçeve grid: 4 boyut × 3 renk (12 hücre), adet + maliyet
- [ ] Çerçeve güncelleme: alındı / defolu / manuel düzeltme
- [ ] Hazır baskı: ürün + boyut bazlı tablo
- [ ] Sarf malzemeleri (threshold altı = kırmızı uyarı)
- [ ] Stok hareket logu görüntüleme
- [ ] Fiyat listesi sayfası (kanal × boyut maliyet tablosu)
- [ ] API: `/api/stock/*`

---

### ⏳ FAZ 3 — Sipariş Yönetimi — BAŞLANMADI

- [ ] Sipariş listesi (kanal, durum, tarih, tutar filtreli)
- [ ] Yeni sipariş formu (müşteri, ürün, boyut, çerçeve, kargo, checkboxlar)
- [ ] Fiyat şablonundan otomatik maliyet hesaplama
- [ ] Sipariş kaydedince otomatik stok düşme
- [ ] Sipariş durumu güncelleme + kargo takip no
- [ ] API: `/api/orders`

---

### ⏳ FAZ 4 — Fiziksel Etkinlikler — BAŞLANMADI

- [ ] Etkinlik oluşturma (tarih, lokasyon, personel, gider)
- [ ] Etkinliğe bağlı toplu satış girişi
- [ ] Etkinlik özet kartı: gelir − gider = net kâr
- [ ] API: `/api/events`

---

### ⏳ FAZ 5 — Finans & Bilanço — BAŞLANMADI

- [ ] KPI kartları (Toplam Satış / Net Kâr / Toplam Gider / Aktif Sipariş)
- [ ] Aylık gelir-gider bar chart (Recharts)
- [ ] Kanal bazlı gelir pasta grafiği
- [ ] En çok satan ürünler tablosu
- [ ] Manuel gider girişi + tarih aralığı filtresi
- [ ] Reklam takip & basit ROI
- [ ] API: `/api/finance/summary`, `/api/expenses`

---

### ⏳ FAZ 6 — Cilalama & Deploy — BAŞLANMADI

- [ ] Responsive (mobil uyum)
- [ ] Loading skeleton'lar
- [ ] Toast bildirimleri (başarı / hata)
- [ ] Excel import script
- [ ] Vercel deploy

---

## 📊 7. Modül → Excel Eşleşmesi

| Modül | Faz | Excel Kaynak |
|---|---|---|
| Ürün Kataloğu | FAZ 1 | Kategoriler, 00~08, 99 sayfaları |
| Stok + Fiyat | FAZ 2 | Çerçeve Stok, Fiyat Listesi |
| Sipariş Yönetimi | FAZ 3 | Siparişler, Eski |
| Etkinlikler | FAZ 4 | Stant |
| Finans | FAZ 5 | Bilanço, Reklam |

---

## 🔮 8. Gelecek (Kapsam Dışı)

- Trendyol / Shopier API entegrasyonu
- Kullanıcı girişi (NextAuth.js)
- PWA
- Barkod okuyucu
- WhatsApp/SMS kargo bildirimi

---

_Son güncelleme: Mart 2026_
