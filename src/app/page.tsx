import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CategorySpendCard } from "@/components/dashboard/CategorySpendCard";
import { HomeGreeting } from "@/components/dashboard/HomeGreeting";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { MonthArrowLink } from "@/components/shared/MonthArrowLink";
import { MonthlyHistoryCard } from "@/components/dashboard/MonthlyHistoryCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import { TransactionTypeFilter } from "@/components/transactions/TransactionTypeFilter";
import { TransactionTypeView } from "@/components/transactions/TransactionTypeView";
import { requireUser } from "@/lib/auth";
import { currentHour, formatMonthTitle, parseMonthKey, todayKey } from "@/lib/dates";
import { getCategoryBreakdown, getMonthTotals, getMonthlyHistory, getRecentTransactions } from "@/lib/transactions";
import { buildHref } from "@/lib/url";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <PageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}

async function HomeContent({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { mes } = await searchParams;
  const user = await requireUser();
  // "Hoy" depende de la fecha de la petición, no del prerender/prefetch.
  await connection();
  const today = todayKey();
  const hour = currentHour();
  const month = parseMonthKey(mes) ?? today.slice(0, 7);

  // Las tres listas llegan juntas para que el filtro de las tarjetas cambie al instante, sin volver al servidor.
  const [totals, breakdown, recent, recentIncome, recentExpenses, history] = await Promise.all([
    getMonthTotals(month),
    getCategoryBreakdown(month),
    getRecentTransactions(month, 6),
    getRecentTransactions(month, 6, "income"),
    getRecentTransactions(month, 6, "expense"),
    getMonthlyHistory(month),
  ]);
  const transactionsHref = (tipo?: string) => buildHref("/transactions", { mes: month, tipo });

  return (
    <>
      {/* Móvil: tema y sesión van en el renglón del saludo para que el mes y las flechas quepan en 375px. */}
      <HomeGreeting user={user} today={today} hour={hour} />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MonthArrowLink month={month} direction="prev" className="hidden lg:flex" />
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em] lg:text-[30px]">{formatMonthTitle(month)}</h1>
          <MonthArrowLink month={month} direction="next" className="hidden lg:flex" />
        </div>
        <div className="flex gap-2 lg:hidden">
          <MonthArrowLink month={month} direction="prev" />
          <MonthArrowLink month={month} direction="next" />
        </div>
        <Link
          href="/new"
          className="hidden h-[46px] items-center gap-2 rounded-control bg-ink px-5 text-[15px] font-bold text-on-ink hover:bg-ink/90 lg:flex"
        >
          <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden />
          Nuevo movimiento
        </Link>
      </header>

      <TransactionTypeFilter>
        <BalanceCard totals={totals} className="lg:hidden" />
        <KpiCards totals={totals} className="hidden lg:grid" />

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          <MonthlyHistoryCard
            title="Ingresos vs gastos · últimos 6 meses"
            points={history}
            currentMonth={month}
            variant="full"
            className="hidden lg:flex lg:flex-[3_1_420px]"
          />
          <CategorySpendCard breakdown={breakdown} summaryHref={`/summary?mes=${month}`} className="lg:flex-[2_1_320px]" />
        </div>

        <TransactionTypeView value="all">
          <RecentTransactionsCard transactions={recent} today={today} transactionsHref={transactionsHref()} />
        </TransactionTypeView>
        <TransactionTypeView value="income">
          <RecentTransactionsCard
            title="Últimos ingresos"
            emptyMessage="Sin ingresos este mes."
            transactions={recentIncome}
            today={today}
            transactionsHref={transactionsHref("ingresos")}
          />
        </TransactionTypeView>
        <TransactionTypeView value="expense">
          <RecentTransactionsCard
            title="Últimos gastos"
            emptyMessage="Sin gastos este mes."
            transactions={recentExpenses}
            today={today}
            transactionsHref={transactionsHref("gastos")}
          />
        </TransactionTypeView>
      </TransactionTypeFilter>
    </>
  );
}
