"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  /** Mismas variantes que ThemeToggle: `icon` en el encabezado móvil, `sidebar` en la barra lateral. */
  variant: "icon" | "sidebar";
  className?: string;
}

export function SignOutButton({ variant, className }: SignOutButtonProps) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    // Descarta lo que el router tenga en caché de las páginas con sesión.
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={signOut}
        className={cn(
          "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas",
          className,
        )}
      >
        <LogOut className="size-5" aria-hidden />
        <span className="sr-only">Cerrar sesión</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={cn(
        "flex h-11 cursor-pointer items-center gap-3 rounded-icon px-3 text-sm font-semibold text-sidebar-muted hover:bg-sidebar-active/60 hover:text-white",
        className,
      )}
    >
      <LogOut className="size-5" aria-hidden />
      Cerrar sesión
    </button>
  );
}
