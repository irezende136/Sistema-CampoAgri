import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ClipboardList,
  CalendarDays,
  Wallet,
  Settings,
  UserCog,
  ShieldCheck,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  platformAdminOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtores", label: "Produtores", icon: Users },
  { href: "/propriedades", label: "Propriedades", icon: MapPin },
  { href: "/visitas", label: "Visitas", icon: ClipboardList },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

export const NAV_ITEMS_SECONDARY: NavItem[] = [
  { href: "/configuracoes", label: "Organização", icon: Settings },
  { href: "/usuarios", label: "Usuários", icon: UserCog },
  { href: "/super-admin", label: "Super Admin", icon: ShieldCheck, platformAdminOnly: true },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/produtores", label: "Produtores", icon: Users },
  { href: "/visitas", label: "Visitas", icon: ClipboardList },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
];
