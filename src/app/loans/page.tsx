import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { DeleteLoanButton } from "@/components/DeleteLoanButton";
import { LoanProgress } from "@/components/LoanProgress";
import { PageContainer } from "@/components/PageContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { formatCurrency } from "@/lib/format";
import { LOAN_ICON } from "@/lib/loan-constants";
import { getLoans } from "@/lib/loans";

export const metadata: Metadata = { title: "Préstamos · Mis Gastos" };

export default function LoansPage() {
  return (
    <PageContainer className="gap-3.5 lg:max-w-3xl lg:gap-4">
      <Suspense fallback={<PageSkeleton />}>
        <LoansContent />
      </Suspense>
    </PageContainer>
  );
}

async function LoansContent() {
  // Siempre leer la versión actual de la base de datos.
  await connection();
  const loans = await getLoans();
  const pending = loans.reduce((sum, l) => sum + Math.max(l.remaining, 0), 0);
  const pendingCount = loans.filter((l) => l.remaining > 0).length;

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] lg:text-[30px]">Préstamos</h1>
        <Link
          href="/loans/new"
          className="flex h-11 items-center gap-1.5 rounded-control bg-ink px-4 text-sm font-bold text-on-ink hover:bg-ink/90"
        >
          <Plus className="size-4.5" strokeWidth={2.4} aria-hidden />
          Nuevo
        </Link>
      </header>

      {loans.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-10 text-center shadow-card">
          <CategoryIcon category={LOAN_ICON} size="lg" />
          <p className="text-sm text-ink-soft">
            Registra el dinero que prestas y ve restando los abonos conforme te pagan.
          </p>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-1 rounded-card bg-panel p-5 text-white shadow-card">
            <span className="text-[13px] font-medium text-night-muted">Te deben</span>
            <span className="text-[34px] leading-tight font-extrabold tracking-[-0.03em]">{formatCurrency(pending)}</span>
            <span className="text-xs text-night-muted">
              {
                pendingCount === 0
                  ? "Todos tus préstamos están liquidados"
                  : `${pendingCount} ${pendingCount === 1 ? "préstamo pendiente" : "préstamos pendientes"}`
              }
            </span>
          </section>

          <ul className="flex flex-col gap-2.5">
            {
              loans.map((loan) => {
                
                const settled = loan.remaining <= 0;

                return (
                  <li
                    key={loan.id}
                    className="flex flex-wrap items-start overflow-hidden rounded-card bg-surface shadow-card hover:shadow-card-hover"
                  >
                    <Link href={`/loans/${loan.id}`} className="flex min-w-0 flex-1 flex-col gap-3 p-4 pr-2">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={LOAN_ICON} />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm font-semibold">{loan.borrower}</span>
                          <span className="truncate text-xs text-ink-soft">
                            {loan.items.map((i) => i.concept).join(", ")} · {formatCurrency(loan.amount)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {settled ? (
                            <span className="rounded-full bg-income-soft px-2.5 py-1 text-xs font-bold text-income">
                              Liquidado
                            </span>
                          ) : (
                            <>
                              <span className="text-sm font-bold whitespace-nowrap">{formatCurrency(loan.remaining)}</span>
                              <span className="text-xs text-ink-soft">pendiente</span>
                            </>
                          )}
                        </div>
                        <ChevronRight className="size-5 shrink-0 text-ink-soft" aria-hidden />
                      </div>
                      {!settled && <LoanProgress loan={loan} />}
                    </Link>
                    <DeleteLoanButton loanId={loan.id} borrower={loan.borrower} variant="icon" />
                  </li>
                );
              })
            }
          </ul>
        </>
      )}
    </>
  );
}
