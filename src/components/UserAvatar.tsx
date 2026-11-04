import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Inicial del nombre en SVG (nítida a cualquier escala), en lugar de la foto de Google,
 * que para cuentas sin foto es una imagen pequeña y borrosa.
 */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const gradientId = useId();
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <svg
      viewBox="0 0 44 44"
      aria-hidden
      className={cn("size-11 shrink-0 rounded-full shadow-card ring-2 ring-surface", className)}
    >
      <defs>
        {/* Colores fijos (ingresos → gastos del modo claro) para que la inicial blanca contraste también en oscuro. */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b6a86" />
          <stop offset="100%" stopColor="#b93d0b" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="22" fill={`url(#${gradientId})`} />
      <text
        x="22"
        y="22"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize="19"
        fontWeight="800"
      >
        {initial}
      </text>
    </svg>
  );
}
