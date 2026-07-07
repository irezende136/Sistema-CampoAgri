import Link from "next/link";
import { Plus } from "lucide-react";
import {
  NAV_ITEMS,
  NAV_ITEMS_SECONDARY,
  BOTTOM_NAV_ITEMS,
} from "@/components/layout/nav-items";
import { SidebarNavLink, BottomNavLink } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import type { OrgContext } from "@/lib/auth/context";

export function AppShell({
  ctx,
  children,
}: {
  ctx: OrgContext;
  children: React.ReactNode;
}) {
  const secondaryItems = NAV_ITEMS_SECONDARY.filter(
    (item) => !item.platformAdminOnly || ctx.isPlatformAdmin
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border h-screen sticky top-0 p-4">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              CA
            </div>
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

          <nav className="mt-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <SidebarNavLink key={item.href} item={item} />
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-border flex flex-col gap-1">
            {secondaryItems.map((item) => (
              <SidebarNavLink key={item.href} item={item} />
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3 lg:px-6">
            <div className="lg:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                CA
              </div>
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

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-border bg-card/95 backdrop-blur">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <BottomNavLink key={item.href} item={item} />
        ))}
      </nav>

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
