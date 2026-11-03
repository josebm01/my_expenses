import { connection } from "next/server";
import { Suspense } from "react";
import { FilterChips } from "@/components/FilterChips";
import { MonthSelect } from "@/components/MonthSelect";
import { PageContainer } from "@/components/PageContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SearchInput } from "@/components/SearchInput";
import { TransactionRow } from "@/components/TransactionRow";
import type { TransactionType } from "@/lib/categories";
import { formatDayHeading, formatMonthName, formatMonthTitle, parseMonthKey, recentMonths, todayKey } from "@/lib/dates";
import { formatSignedCurrency } from "@/lib/format";
import { getMonthTotals, getTransactionsByDay, type Transaction } from "@/lib/transactions";
import { buildHref, firstParam } from "@/lib/url";

const TYPE_FILTERS: { value?: string; label: string; type?: TransactionType }[] = [
  { label: "Todos" },
  { value: "gastos", label: "Gastos", type: "expense" },
  { value: "ingresos", label: "Ingresos", type: "income" },
];

export default function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  return (
    <PageContainer className="gap-3.5 lg:max-w-3xl lg:gap-4">
      <Suspense fallback={<PageSkeleton />}>
        <TransactionsContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}

function rowMeta(t: Transaction): string {
  const category = t.category.name;
  return t.concept && t.note ? `${category} · ${t.note}` : category;
}

async function TransactionsContent({ searchParams }: Pick<PageProps<"/transactions">, "searchParams">) {
  const params = await searchParams;
  // "Hoy" depende de la fecha de la petición, no del prerender/prefetch.
  await connection();
  const today = todayKey();
  const currentMonth = today.slice(0, 7);
  const month = parseMonthKey(firstParam(params.mes)) ?? currentMonth;
  const filter = TYPE_FILTERS.find((f) => f.value && f.value === firstParam(params.tipo)) ?? TYPE_FILTERS[0];
  const query = firstParam(params.q) ?? "";

  const [totals, groups] = await Promise.all([
    getMonthTotals(month),
    getTransactionsByDay({ month, type: filter.type, query }),
  ]);

  const mes = month === currentMonth ? undefined : month;
  const hrefWith = (overrides: Record<string, string | undefined>) =>
    buildHref("/transactions", { mes, tipo: filter.value, q: query, ...overrides });

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] lg:text-[30px]">Movimientos</h1>
        <MonthSelect
          value={month}
          label={formatMonthName(month)}
          options={recentMonths(currentMonth, month).map((m) => ({
            value: m,
            label: formatMonthTitle(m),
            href: hrefWith({ mes: m === currentMonth ? undefined : m }),
          }))}
        />
      </header>

      <SearchInput
        defaultValue={query}
        basePath="/transactions"
        params={Object.fromEntries(Object.entries({ mes, tipo: filter.value }).filter(([, v]) => v)) as Record<string, string>}
      />

      <FilterChips
        label="Filtrar por tipo"
        chips={TYPE_FILTERS.map((f) => ({ label: f.label, href: hrefWith({ tipo: f.value }), active: f === filter }))}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-0.5 rounded-control bg-surface px-3 py-2.5 shadow-card">
          <span className="text-xs font-semibold text-ink-soft">Ingresos</span>
          <span className="text-base font-extrabold text-income">{formatSignedCurrency(totals.income)}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-control bg-surface px-3 py-2.5 shadow-card">
          <span className="text-xs font-semibold text-ink-soft">Gastos</span>
          <span className="text-base font-extrabold text-expense">{formatSignedCurrency(-totals.expenses)}</span>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-[18px] bg-surface shadow-card px-4 py-10 text-center text-sm text-ink-soft">
          {query ? `No hay movimientos que coincidan con “${query}”.` : "Sin movimientos este mes."}
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.day} className="flex flex-col gap-1.5">
            <div className="flex justify-between px-1 text-[13px] text-ink-soft">
              <h2 className="font-bold">{formatDayHeading(group.day, today)}</h2>
              <span className="font-semibold">{formatSignedCurrency(group.total)}</span>
            </div>
            <ul className="flex flex-col rounded-[18px] bg-surface shadow-card px-3.5 py-1">
              {group.transactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  meta={rowMeta(t)}
                  href={`/transactions/${t.id}`}
                  className="py-2.5"
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
