import { PanelShell } from "@/components/panel-shell";

export default function UrunlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelShell>{children}</PanelShell>;
}
