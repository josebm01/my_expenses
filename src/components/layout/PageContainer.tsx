import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Márgenes de página: móvil con espacio para la barra inferior, escritorio junto al sidebar. */
export function PageContainer({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-xl flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+108px)]",
        "lg:max-w-[1200px] lg:gap-6 lg:px-10 lg:pt-8 lg:pb-12",
        className,
      )}
    >
      {children}
    </main>
  );
}
