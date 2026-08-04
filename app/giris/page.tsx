import Image from "next/image";
import { signIn, AUTH_ENABLED } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Giriş — ArtVista OS" };

export default function GirisPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="ArtVista"
            width={180}
            height={68}
            className="object-contain"
            priority
          />
          <p className="mt-1 text-xs text-zinc-500">Yönetim Paneli</p>
        </div>

        {AUTH_ENABLED ? (
          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/urunler" });
            }}
          >
            <Button type="submit" className="w-full">
              Google ile giriş yap
            </Button>
          </form>
        ) : (
          <p className="mt-8 text-center text-sm text-zinc-500">
            Giriş sistemi henüz yapılandırılmadı.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-zinc-400">
          Yalnızca yetkili hesaplar erişebilir.
        </p>
      </div>
    </div>
  );
}
