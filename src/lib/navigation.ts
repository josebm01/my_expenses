import { ChartPie, HandCoins, House, List, SlidersHorizontal, Tag, type LucideIcon } from "lucide-react";
import { todayKey, type DayKey } from "./dates";
import { buildHref } from "./url";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Sin `href` la sección aún no existe y se muestra deshabilitada. */
  href?: string;
}

export const HOME: NavItem = { href: "/", label: "Inicio", icon: House };
export const TRANSACTIONS: NavItem = { href: "/transactions", label: "Movimientos", icon: List };
export const SUMMARY: NavItem = { href: "/summary", label: "Resumen", icon: ChartPie };
export const LOANS: NavItem = { href: "/loans", label: "Préstamos", icon: HandCoins };
export const CATEGORIES_NAV: NavItem = { href: "/categories", label: "Categorías", icon: Tag };
export const SETTINGS: NavItem = { label: "Ajustes", icon: SlidersHorizontal };

/** De dónde se abrió el formulario de un movimiento; ahí se regresa al cerrar o guardar. */
export type TransactionOrigin = "home" | "transactions";

/** Inicio o Movimientos en el mes de `day` (sin `?mes=` si es el mes en curso). */
export function transactionOriginHref(origin: TransactionOrigin, day: DayKey): string {
  const month = day.slice(0, 7);
  return buildHref(origin === "home" ? "/" : "/transactions", { mes: month === todayKey().slice(0, 7) ? undefined : month });
}

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
