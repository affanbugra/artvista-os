# ArtVista OS

ArtVista Poster Türkiye yönetim paneli. Next.js 14 · Drizzle ORM · libSQL/Turso · Auth.js

**Şu an açık modül:** yalnızca **Ürünler**. Diğer sekmeler sidebar'da soluk görünür,
tıklanmaz ve URL'den de girilemez (`middleware.ts`).

---

## Lokal geliştirme

```bash
npm install
npm run dev      # http://localhost:3000 → /urunler
```

`.env.local` boşken uygulama **lokal `artvista.db` dosyasını** kullanır ve
**giriş sistemi kapalıdır**. Yani kurulum beklemeden çalışır.

---

## Kurulum adımları (hesap açman gerekenler)

### 1. GitHub

```bash
gh repo create artvista-os --private --source=. --push
# veya github.com'da boş repo aç, sonra:
# git remote add origin https://github.com/<kullanıcı>/artvista-os.git
# git push -u origin main
```

### 2. Turso (paylaşımlı veritabanı)

```bash
# turso.tech üzerinden ücretsiz hesap aç, sonra:
turso auth login
turso db create artvista
turso db show artvista --url        # → TURSO_DATABASE_URL
turso db tokens create artvista     # → TURSO_AUTH_TOKEN
```

İkisini `.env.local` içine yaz, sonra şemayı ve başlangıç verisini yükle:

```bash
npm run db:push     # tabloları oluşturur
npm run db:seed     # kategoriler, fiyat şablonları, stok satırları
```

Lokaldeki mevcut ürünleri de taşımak için:

```bash
turso db shell artvista < db/dump.sql
# dump: sqlite3 artvista.db .dump > db/dump.sql
```

### 3. Vercel (yayın)

1. vercel.com → **Add New → Project** → GitHub reposunu seç
2. **Environment Variables** bölümüne ekle:
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAILS`
3. Deploy

> Hobby planı ücretsizdir ancak ticari kullanıma izin vermez; gerçek satış
> verisi işlenecekse Pro plana geçilmelidir.

### 4. Google ile giriş

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **Create Credentials → OAuth client ID → Web application**
2. **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<vercel-adresin>/api/auth/callback/google`
3. Client ID / Secret → `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
4. `AUTH_SECRET` üret: `npx auth secret`
5. `ALLOWED_EMAILS=sen@gmail.com,arkadas@gmail.com`

`AUTH_GOOGLE_ID` tanımlandığı anda giriş zorunlu hale gelir.
**Listede olmayan hiç kimse giremez** (liste boşsa kimse giremez).

### 5. Domain (opsiyonel)

Vercel → Project → **Settings → Domains** → `panel.artvista.com` ekle,
gösterilen CNAME kaydını alan adı sağlayıcına gir.
Sonra Google Console'daki redirect URI'yi de yeni domainle güncelle.

---

## Yeni modül açma

1. `components/sidebar.tsx` → ilgili satırda `enabled: true`
2. `middleware.ts` → `OPEN_ROUTES` dizisine rotayı ekle
3. Sayfa klasörüne `layout.tsx` ekle (`app/urunler/layout.tsx` örnek alınabilir)

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run db:generate` | Şemadan migration üret |
| `npm run db:push` | Şemayı doğrudan DB'ye uygula |
| `npm run db:seed` | Başlangıç verisini yükle |
