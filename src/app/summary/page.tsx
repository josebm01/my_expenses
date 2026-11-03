import { connection } from "next/server";
import { Suspense } from "react";
import { Card } from "@/components/Card";
import { CategoryIcon } from "@/components/CategoryIcon";
import { MonthSelect } from "@/components/MonthSelect";
import { MonthlyHistoryCard } from "@/components/MonthlyHistoryCard";
import { PageContainer } from "@/components/PageContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SpendingDonut } from "@/components/SpendingDonut";
import { formatMonthName, formatMonthTitle, parseMonthKey, recentMonths, shiftMonth, todayKey } from "@/lib/dates";
import { formatChange, formatCurrency, formatPercent, formatSignedPercent } from "@/lib/format";
import { getCategoryBreakdown, getDailyAverage, getMonthTotals, getMonthlyHistory } from "@/lib/transactions";
import { buildHref, firstParam } from "@/lib/url";
import { cn } from "@/lib/utils";

/** Más gasto = naranja, menos gasto = azul. */
function changeColor(change: number | null): string {
  if (change === null || Math.round(change) === 0) return "text-ink-soft";
  return change > 0 ? "text-expense" : "text-income";
}

export default function SummaryPage({ searchParams }: PageProps<"/summary">) {
  return (
    <PageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <SummaryContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}

async function SummaryContent({ searchParams }: Pick<PageProps<"/summary">, "searchParams">) {
  const { mes } = await searchParams;
  // "Hoy" depende de la fecha de la petición, no del prerender/prefetch.
  await connection();
  const today = todayKey();
  const currentMonth = today.slice(0, 7);
  const month = parseMonthKey(firstParam(mes)) ?? currentMonth;
  const previousMonth = shiftMonth(month, -1);

  const [totals, previousTotals, breakdown, history, dailyAverage] = await Promise.all([
    getMonthTotals(month),
    getMonthTotals(previousMonth),
    getCategoryBreakdown(month),
    getMonthlyHistory(month),
    getDailyAverage(month, today),
  ]);
  const expenseChange =
    previousTotals.expenses > 0 ? ((totals.expenses - previousTotals.expenses) / previousTotals.expenses) * 100 : null;

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] lg:text-[30px]">Resumen</h1>
        <MonthSelect
          value={month}
          label={formatMonthTitle(month)}
          options={recentMonths(currentMonth, month).map((m) => ({
            value: m,
            label: formatMonthTitle(m),
            href: buildHref("/summary", { mes: m === currentMonth ? undefined : m }),
          }))}
        />
      </header>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <Card className="items-center gap-4 px-4 py-5">
          <SpendingDonut
            ariaLabel={`Distribución de gastos de ${formatMonthName(month).toLowerCase()} por categoría`}
            slices={breakdown.map(({ category, amount }) => ({ name: category.name, amount, fill: category.chartColor }))}
          >
            <span className="text-xs font-semibold text-ink-soft">Gastado</span>
            <span className="text-[22px] font-extrabold tracking-[-0.02em]">{formatCurrency(totals.expenses, { whole: true })}</span>
            {totals.income > 0 && (
              <span className="text-xs text-ink-soft">de {formatCurrency(totals.income, { whole: true })}</span>
            )}
          </SpendingDonut>
          <div className="grid w-full grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-0.5 rounded-control bg-canvas px-3 py-2.5">
              <span className="text-xs font-semibold text-ink-soft">Promedio diario</span>
              <span className="text-base font-extrabold">{formatCurrency(dailyAverage)}</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-control bg-canvas px-3 py-2.5">
              <span className="text-xs font-semibold text-ink-soft">vs {formatMonthName(previousMonth).toLowerCase()}</span>
              <span className={cn("text-base font-extrabold", changeColor(expenseChange))}>
                {expenseChange === null ? "—" : formatSignedPercent(expenseChange)}
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Por categoría"
          aside={<span className="text-xs font-semibold text-ink-soft">vs mes anterior</span>}
          className="gap-1 lg:row-span-2"
        >
          {breakdown.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">Aún no hay gastos este mes.</p>
          ) : (
            <ul className="flex flex-col pt-1.5">
              {breakdown.map(({ category, amount, share, change }) => (
                <li key={category.id} className="flex items-center gap-3 py-2">
                  <CategoryIcon category={category} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">{category.name}</span>
                    <span className="text-xs text-ink-soft">{formatPercent(share)} del gasto</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-bold">{formatCurrency(amount)}</span>
                    <span className={cn("text-xs font-bold", changeColor(change))}>{formatChange(change)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <MonthlyHistoryCard title="Últimos 6 meses" points={history} currentMonth={month} variant="compact" />
      </div>
    </>
  );
}
