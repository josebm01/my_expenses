import { Card } from "@/components/shared/Card";
import { MonthlyHistoryChart } from "@/components/dashboard/MonthlyHistoryChart";
import { formatMonthName, formatMonthShort, type MonthKey } from "@/lib/dates";
import { formatSignedCurrency } from "@/lib/format";
import type { MonthHistoryPoint } from "@/lib/transactions";
import { cn } from "@/lib/utils";

interface MonthlyHistoryCardProps {
  title: string;
  points: MonthHistoryPoint[];
  currentMonth: MonthKey;
  variant: "compact" | "full";
  className?: string;
}

function Legend() {
  return (
    <div className="flex gap-3 text-xs font-semibold text-ink-soft lg:gap-3.5">
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-income" />
        Ingresos
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-expense-chart" />
        Gastos
      </span>
    </div>
  );
}

export function MonthlyHistoryCard({ title, points, currentMonth, variant, className }: MonthlyHistoryCardProps) {
  const data = points.map((p) => ({
    label: formatMonthShort(p.month),
    income: p.income,
    expenses: p.expenses,
    balanceLabel: formatSignedCurrency(p.income - p.expenses, { whole: true }),
    isCurrent: p.month === currentMonth,
  }));
  const first = points[0]?.month ?? currentMonth;
  const ariaLabel = `Ingresos y gastos de ${formatMonthName(first).toLowerCase()} a ${formatMonthName(currentMonth).toLowerCase()}`;

  return (
    <Card title={title} aside={<Legend />} className={cn("gap-3.5 lg:gap-4", className)}>
      <MonthlyHistoryChart data={data} variant={variant} ariaLabel={ariaLabel} />
    </Card>
  );
}
