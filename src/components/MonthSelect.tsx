"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";

export interface MonthOption {
  value: string;
  label: string;
  href: string;
}

interface MonthSelectProps {
  value: string;
  /** Texto visible en la píldora ("Octubre" o "Octubre 2026"). */
  label: string;
  options: MonthOption[];
}

/** Píldora con un `<select>` nativo encima: en iPhone abre el selector del sistema. */
export function MonthSelect({ value, label, options }: MonthSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label
      className="relative flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-white px-3 text-[13px] font-semibold text-ink has-focus-visible:ring-2 has-focus-visible:ring-ink-soft/50 data-pending:opacity-60"
      data-pending={isPending ? "" : undefined}
    >
      {label}
      <ChevronDown className="size-4" aria-hidden />
      <select
        aria-label="Mes"
        value={value}
        onChange={(event) => {
          const option = options.find((o) => o.value === event.target.value);
          if (option) startTransition(() => router.push(option.href, { scroll: false }));
        }}
        className="absolute inset-x-0 -inset-y-1 cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
