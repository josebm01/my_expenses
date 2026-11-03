import type { ReactNode } from "react";

/** Pantalla de formulario a pantalla completa (sin barra inferior), con su propio botón de cerrar. */
export function FormPageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+20px)] lg:min-h-0 lg:py-10">
      {children}
    </main>
  );
}
