import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FilterChip {
  label: string;
  href: string;
  active: boolean;
}

export function FilterChips({ chips, label }: { chips: FilterChip[]; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          replace
          scroll={false}
          aria-current={chip.active ? "true" : undefined}
          className={cn(
            "hit-44 flex h-9 items-center rounded-full border px-4 text-[13px] font-bold",
            chip.active ? "border-ink bg-ink text-on-ink" : "border-line-strong bg-surface text-ink hover:bg-canvas",
          )}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
