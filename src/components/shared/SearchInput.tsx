"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  defaultValue: string;
  /** Ruta y parámetros a conservar (mes, tipo); `q` se agrega o quita. */
  basePath: string;
  params: Record<string, string>;
}

export function SearchInput({ defaultValue, basePath, params }: SearchInputProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  function handleChange(value: string) {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const search = new URLSearchParams(params);
      if (value.trim()) search.set("q", value.trim());
      startTransition(() => router.replace(`${basePath}?${search}`, { scroll: false }));
    }, 250);
  }

  return (
    <label className="flex h-[46px] items-center gap-2.5 rounded-control border border-line bg-surface px-3.5 has-focus-visible:border-ink-soft">
      <Search className="size-[18px] shrink-0 text-ink-soft" aria-hidden />
      <span className="sr-only">Buscar movimiento</span>
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Buscar por concepto o nota"
        className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-placeholder"
      />
    </label>
  );
}
