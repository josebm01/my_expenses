"use client";

import { Moon, Sun } from "lucide-react";
import { applyTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function toggleTheme() {
  const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Sin almacenamiento (modo privado) el cambio dura solo esta visita.
  }
}

interface ThemeToggleProps {
  /** `icon` = botón cuadrado (encabezado móvil), `sidebar` = renglón con texto en la barra lateral. */
  variant: "icon" | "sidebar";
  className?: string;
}

/**
 * El servidor no sabe qué modo está activo, así que ícono y texto se eligen con `dark:` en CSS
 * (sin estado de React ni diferencias de hidratación).
 */
export function ThemeToggle({ variant, className }: ThemeToggleProps) {
  const icons = (
    <>
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </>
  );

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas",
          className,
        )}
      >
        {icons}
        <span className="sr-only dark:hidden">Activar modo oscuro</span>
        <span className="sr-only hidden dark:inline">Activar modo claro</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex h-11 cursor-pointer items-center gap-3 rounded-icon px-3 text-sm font-semibold text-sidebar-muted hover:bg-sidebar-active/60 hover:text-white",
        className,
      )}
    >
      {icons}
      <span className="dark:hidden">Modo oscuro</span>
      <span className="hidden dark:inline">Modo claro</span>
    </button>
  );
}
