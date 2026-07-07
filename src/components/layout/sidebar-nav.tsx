"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/components/layout/nav-items";

export function SidebarNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-muted"
      )}
    >
      <Icon size={18} strokeWidth={2} />
      {item.label}
    </Link>
  );
}

export function BottomNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {item.label}
    </Link>
  );
}
