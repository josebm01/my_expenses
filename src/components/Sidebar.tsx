"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES_NAV, HOME, SETTINGS, SUMMARY, TRANSACTIONS, isActivePath } from "@/lib/navigation";

const ITEMS = [HOME, TRANSACTIONS, SUMMARY, CATEGORIES_NAV, SETTINGS];

// `usePathname` va dentro de Suspense: en rutas con parámetros dinámicos (/categories/[id]) la ruta
// solo se conoce al pedir la página, y sin el límite bloquearía el prerender del layout.
export function Sidebar() {
  return (
    <Suspense fallback={<SidebarContent pathname={null} />}>
      <CurrentSidebar />
    </Suspense>
  );
}

function CurrentSidebar() {
  return <SidebarContent pathname={usePathname()} />;
}

/** Con `pathname` nulo no marca ninguna sección como activa. */
function SidebarContent({ pathname }: { pathname: string | null }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col gap-7 bg-ink px-[18px] py-7 text-white lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-white text-base font-extrabold text-ink">
          $
        </span>
        <span className="text-[17px] font-extrabold">Mis Gastos</span>
      </div>

      <nav aria-label="Navegación principal" className="flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const className = "flex h-11 items-center gap-3 rounded-icon px-3 text-sm";
          if (!href) {
            return (
              <span key={label} aria-disabled="true" title="Próximamente" className={cn(className, "font-semibold text-sidebar-muted/60")}>
                <Icon className="size-5" aria-hidden />
                {label}
              </span>
            );
          }
          const active = pathname !== null && isActivePath(pathname, href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                className,
                active ? "bg-sidebar-active font-bold text-white" : "font-semibold text-sidebar-muted hover:bg-sidebar-active/60 hover:text-white",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
