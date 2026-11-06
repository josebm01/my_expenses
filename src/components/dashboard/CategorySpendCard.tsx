import { Card } from "@/components/shared/Card";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CategorySpend } from "@/lib/transactions";
import { cn } from "@/lib/utils";

interface CategorySpendCardProps {
  breakdown: CategorySpend[];
  summaryHref: string;
  className?: string;
}

function StackedBar({ breakdown, chart, className }: { breakdown: CategorySpend[]; chart?: boolean; className?: string }) {
  return (
    <div className={cn("gap-0.5 overflow-hidden rounded-full", className)} aria-hidden>
      {breakdown.map(({ category, share }) => (
        <div
          key={category.id}
          className="h-full"
          style={{ width: `${share}%`, backgroundColor: chart ? category.chartColor : category.color }}
        />
      ))}
    </div>
  );
}

/** Móvil: top 3 con ícono y barra. Escritorio: todas las categorías con punto de color. */
export function CategorySpendCard({ breakdown, summaryHref, className }: CategorySpendCardProps) {
  const top = breakdown.slice(0, 3);
  const max = breakdown[0]?.amount ?? 0;

  return (
    <Card
      title="Gastos por categoría"
      link={{ href: summaryHref, label: "Ver todo", className: "lg:hidden" }}
      className={cn("gap-3.5 lg:gap-3", className)}
    >
      {breakdown.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">Aún no hay gastos este mes.</p>
      ) : (
        <>
          <StackedBar breakdown={breakdown} className="flex h-2.5 lg:hidden" />
          <StackedBar breakdown={breakdown} chart className="hidden h-3 lg:flex" />

          <ul className="flex flex-col gap-3.5 lg:hidden">
            {top.map(({ category, amount, share }) => (
              <li key={category.id} className="flex items-center gap-3">
                <CategoryIcon category={category} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-semibold">{category.name}</span>
                    <span className="font-bold">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-track">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(amount / max) * 100}%`, backgroundColor: category.color }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-xs font-semibold text-ink-soft">{formatPercent(share)}</span>
              </li>
            ))}
          </ul>

          <ul className="hidden flex-col lg:flex">
            {breakdown.map(({ category, amount, share }) => (
              <li key={category.id} className="flex items-center gap-2.5 py-[3px]">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: category.chartColor }} />
                <span className="flex-1 truncate text-sm font-semibold">{category.name}</span>
                <span className="w-12 text-right text-[13px] text-ink-soft">{formatPercent(share)}</span>
                <span className="w-24 text-right text-sm font-bold">{formatCurrency(amount)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
