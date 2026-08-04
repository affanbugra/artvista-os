import { Sidebar } from "@/components/sidebar";

/** Sidebar + içerik alanı. Panel sayfalarının ortak kabuğu. */
export function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
