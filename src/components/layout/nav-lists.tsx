"use client";

import { NAV_ITEMS, NAV_ITEMS_SECONDARY, BOTTOM_NAV_ITEMS } from "@/components/layout/nav-items";
import { SidebarNavLink, BottomNavLink } from "@/components/layout/sidebar-nav";

// Estes componentes existem para que os ícones (componentes React) do menu
// nunca precisem atravessar a fronteira Server -> Client como prop — o
// Next.js não permite serializar referências de função/componente nessa
// direção. Importando NAV_ITEMS aqui dentro, tudo fica resolvido no bundle
// do cliente.

export function PrimarySidebarNav() {
  return (
    <nav className="mt-6 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <SidebarNavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}

export function SecondarySidebarNav({ isPlatformAdmin }: { isPlatformAdmin: boolean }) {
  const items = NAV_ITEMS_SECONDARY.filter((item) => !item.platformAdminOnly || isPlatformAdmin);

  return (
    <div className="mt-6 pt-6 border-t border-border flex flex-col gap-1">
      {items.map((item) => (
        <SidebarNavLink key={item.href} item={item} />
      ))}
    </div>
  );
}

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-border bg-card/95 backdrop-blur">
      {BOTTOM_NAV_ITEMS.map((item) => (
        <BottomNavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}
