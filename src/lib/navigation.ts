import { ChartPie, House, List, SlidersHorizontal, Tag, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Sin `href` la sección aún no existe y se muestra deshabilitada. */
  href?: string;
}

export const HOME: NavItem = { href: "/", label: "Inicio", icon: House };
export const TRANSACTIONS: NavItem = { href: "/transactions", label: "Movimientos", icon: List };
export const SUMMARY: NavItem = { href: "/summary", label: "Resumen", icon: ChartPie };
export const CATEGORIES_NAV: NavItem = { href: "/categories", label: "Categorías", icon: Tag };
export const SETTINGS: NavItem = { label: "Ajustes", icon: SlidersHorizontal };

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
