import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  /** Enlace a la derecha del título ("Ver todo"). */
  link?: { href: string; label: string; className?: string };
  /** Contenido a la derecha del título cuando no es un enlace (leyendas, notas). */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, link, aside, className, children }: CardProps) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-card bg-surface p-4 shadow-card lg:rounded-panel lg:p-5", className)}>
      {title && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold lg:text-[17px]">{title}</h2>
          {link && (
            <Link href={link.href} className={cn("text-[13px] font-bold text-income hover:text-income-hover", link.className)}>
              {link.label}
            </Link>
          )}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
