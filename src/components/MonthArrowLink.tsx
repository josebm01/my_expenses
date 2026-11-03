import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftMonth, type MonthKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface MonthArrowLinkProps {
  month: MonthKey;
  direction: "prev" | "next";
  className?: string;
}

export function MonthArrowLink({ month, direction, className }: MonthArrowLinkProps) {
  const target = shiftMonth(month, direction === "prev" ? -1 : 1);
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <Link
      href={`/?mes=${target}`}
      aria-label={direction === "prev" ? "Mes anterior" : "Mes siguiente"}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-icon border border-line bg-white text-ink hover:bg-canvas",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
    </Link>
  );
}
