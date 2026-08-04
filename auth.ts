import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google ile giriş + e-posta beyaz listesi.
 *
 * Gerekli ortam değişkenleri (Vercel + .env.local):
 *   AUTH_SECRET        → `npx auth secret` ile üret
 *   AUTH_GOOGLE_ID     → Google Cloud Console OAuth istemci kimliği
 *   AUTH_GOOGLE_SECRET → Google Cloud Console OAuth istemci parolası
 *   ALLOWED_EMAILS     → virgülle ayrılmış izinli e-postalar
 *
 * AUTH_GOOGLE_ID tanımlı değilken giriş sistemi tamamen devre dışı kalır,
 * böylece lokal geliştirme kurulum beklemeden çalışır.
 */
export const AUTH_ENABLED = Boolean(process.env.AUTH_GOOGLE_ID);

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "artvista-local-dev-secret",
  providers: AUTH_ENABLED ? [Google] : [],
  session: { strategy: "jwt" },
  pages: { signIn: "/giris", error: "/giris" },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      // Liste boşsa kimse giremez — yanlışlıkla herkese açılmasın.
      return allowedEmails.includes(email);
    },
  },
});
