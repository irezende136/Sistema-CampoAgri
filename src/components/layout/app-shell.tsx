import Link from "next/link";
import { Plus } from "lucide-react";
import { PrimarySidebarNav, SecondarySidebarNav, BottomNav } from "@/components/layout/nav-lists";
import { UserMenu } from "@/components/layout/user-menu";
import { OrgMark } from "@/components/layout/org-mark";
import { darkenHex, readableTextColor } from "@/lib/utils/color";
import type { OrgContext } from "@/lib/auth/context";

export function AppShell({
  ctx,
  logoUrl,
  children,
}: {
  ctx: OrgContext;
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  const cor = ctx.organization?.cor_primaria || "#1f4d3a";
  const themeStyle = {
    "--primary": cor,
    "--primary-dark": darkenHex(cor, 0.18),
    "--primary-foreground": readableTextColor(cor),
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={themeStyle}>
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border h-screen sticky top-0 p-4">
          <div className="flex items-center gap-2 px-2 py-3">
            <OrgMark logoUrl={logoUrl} />
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{ctx.organization?.nome ?? "CampoAgri"}</div>
              <div className="text-xs text-muted-foreground">Sistema CampoAgri</div>
            </div>
          </div>

          <Link
            href="/visitas/nova"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground font-semibold py-3 text-sm hover:brightness-95"
          >
            <Plus size={18} /> Nova visita
          </Link>

          <PrimarySidebarNav />
          <SecondarySidebarNav isPlatformAdmin={ctx.isPlatformAdmin} />

          <div className="mt-auto pt-4 text-xs text-muted-foreground">
            <Link href="/termos" className="hover:text-foreground">
              Termos
            </Link>{" "}
            ·{" "}
            <Link href="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3 lg:px-6">
            <div className="lg:hidden flex items-center gap-2">
              <OrgMark logoUrl={logoUrl} size={32} />
              <span className="font-semibold text-sm truncate max-w-[160px]">
                {ctx.organization?.nome ?? "CampoAgri"}
              </span>
            </div>
            <div className="flex-1" />
            <UserMenu email={ctx.email} role={ctx.role} />
          </header>

          <main className="p-4 pb-24 lg:pb-6 lg:p-6 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>

      <BottomNav />

      <Link
        href="/visitas/nova"
        className="lg:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center"
        aria-label="Nova visita"
      >
        <Plus size={26} />
      </Link>
    </div>
  );
}
