"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOME, LOANS, SUMMARY, TRANSACTIONS, isActivePath, type NavItem } from "@/lib/navigation";

const itemClass = "flex min-h-11 min-w-15 flex-col items-center gap-1 pt-1.5 text-[11px]";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const { href, label, icon: Icon } = item;
  if (!href) {
    return (
      <span aria-disabled="true" title="Próximamente" className={cn(itemClass, "font-semibold text-ink-soft")}>
        <Icon className="size-[22px]" aria-hidden />
        {label}
      </span>
    );
  }
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(itemClass, active ? "font-bold text-ink" : "font-semibold text-ink-soft")}
    >
      <Icon className="size-[22px]" aria-hidden />
      {label}
    </Link>
  );
}

// Igual que en Sidebar: `usePathname` dentro de Suspense para no bloquear el prerender de rutas dinámicas.
export function BottomNav() {
  return (
    <Suspense>
      <CurrentBottomNav />
    </Suspense>
  );
}

function CurrentBottomNav() {
  const pathname = usePathname();
  // Las pantallas de formulario tienen su propio botón de cerrar; el login no lleva navegación.
  if (
    pathname.startsWith("/new") ||
    pathname.startsWith("/transactions/") ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/loans/") ||
    pathname === "/login"
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 flex items-start justify-around border-t border-line bg-surface px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),12px)] lg:hidden"
    >
      <NavLink item={HOME} pathname={pathname} />
      <NavLink item={TRANSACTIONS} pathname={pathname} />
      <Link
        href="/new"
        aria-label="Agregar movimiento"
        className="-mt-0.5 flex size-14 items-center justify-center rounded-[18px] bg-ink text-on-ink"
      >
        <Plus className="size-[26px]" strokeWidth={2.4} aria-hidden />
      </Link>
      <NavLink item={SUMMARY} pathname={pathname} />
      {/* "Ajustes" aún no existe: en móvil su lugar lo ocupa Préstamos (el sidebar muestra ambos). */}
      <NavLink item={LOANS} pathname={pathname} />
    </nav>
  );
}
