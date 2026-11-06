import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronLeft, Pencil } from "lucide-react";
import { DeleteLoanButton } from "@/components/DeleteLoanButton";
import { FormPageContainer } from "@/components/FormPageContainer";
import { LoanEntryForm } from "@/components/LoanEntryForm";
import { LoanEntryRow } from "@/components/LoanEntryRow";
import { LoanProgress } from "@/components/LoanProgress";
import { PageSkeleton } from "@/components/PageSkeleton";
import { formatShortDateWithYear, toDayKey, todayKey } from "@/lib/dates";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/lib/format";
import { getLoan } from "@/lib/loans";

export const metadata: Metadata = { title: "Préstamo · Mis Gastos" };

const iconButton =
  "flex size-11 items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas";

export default function LoanPage({ params }: PageProps<"/loans/[id]">) {
  return (
    // Escritorio: más ancho y a dos columnas (resumen y montos | abonos).
    <FormPageContainer className="lg:max-w-5xl lg:px-10">
      <Suspense fallback={<PageSkeleton />}>
        <LoanContent params={params} />
      </Suspense>
    </FormPageContainer>
  );
}

async function LoanContent({ params }: Pick<PageProps<"/loans/[id]">, "params">) {
  const { id } = await params;
  // Siempre leer la versión actual de la base de datos.
  await connection();
  const loan = await getLoan(id);
  if (!loan) notFound();

  const today = todayKey();
  const settled = loan.remaining <= 0;
  const dateLabel = (date: Date) => formatShortDateWithYear(toDayKey(date));

  return (
    <div className="flex flex-col gap-[18px] lg:gap-6">
      <div className="flex items-center justify-between gap-3 lg:justify-start">
        <Link href="/loans" aria-label="Volver a Préstamos" className={iconButton}>
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="min-w-0 truncate text-[17px] font-bold lg:flex-1 lg:text-[30px] lg:font-extrabold lg:tracking-[-0.02em]">
          Préstamo a {loan.borrower}
        </h1>
        <Link href={`/loans/${loan.id}/edit`} aria-label="Editar préstamo" className={iconButton}>
          <Pencil className="size-[18px]" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-[18px] lg:gap-4">
          <section className="flex flex-col gap-4 rounded-card bg-panel p-5 text-white shadow-card">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-night-muted">{settled ? "Liquidado" : "Por cobrar"}</span>
              <span className="text-[38px] leading-tight font-extrabold tracking-[-0.03em]">
                {formatCurrency(Math.max(loan.remaining, 0))}
              </span>
            </div>
            <LoanProgress loan={loan} onDark />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1 rounded-control bg-night p-3">
                <span className="text-xs font-medium text-night-muted">Prestado</span>
                <span className="text-lg font-bold">{formatCurrency(loan.amount)}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-control bg-night p-3">
                <span className="text-xs font-medium text-night-muted">
                  Cobrado · {formatPercent(loan.amount > 0 ? (loan.paid / loan.amount) * 100 : 0)}
                </span>
                <span className="text-lg font-bold">{formatCurrency(loan.paid)}</span>
              </div>
            </div>
          </section>

          <p className="px-1 text-xs text-ink-soft">
            {loan.countInTotals
              ? "Cuenta en tus totales: cada monto es un gasto y cada abono un ingreso, en la categoría Préstamos."
              : "No cuenta en tus gastos ni ingresos; solo se lleva aquí."}{" "}
            <Link href={`/loans/${loan.id}/edit`} className="hit-44 font-bold text-income hover:text-income-hover">
              Cambiar
            </Link>
          </p>

          <section className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-base font-bold">Prestado</h2>
              <span className="text-sm font-bold">{formatCurrency(loan.amount)}</span>
            </div>
            <ul className="flex flex-col divide-y divide-line">
              {loan.items.map((item) => (
                <LoanEntryRow
                  key={item.id}
                  kind="item"
                  loanId={loan.id}
                  entryId={item.id}
                  title={item.concept}
                  meta={dateLabel(item.date)}
                  amount={formatCurrency(item.amount)}
                  confirmText={
                    <>
                      ¿Borrar <strong>{item.concept}</strong>? El total prestado baja a{" "}
                      <strong>{formatCurrency(loan.amount - item.amount)}</strong>.
                    </>
                  }
                />
              ))}
            </ul>
            <LoanEntryForm key={loan.items.length} kind="item" loanId={loan.id} today={today} />
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-[18px] lg:gap-4">
          {!settled && (
            <LoanEntryForm
              key={loan.payments.length}
              kind="payment"
              loanId={loan.id}
              today={today}
              minDate={toDayKey(loan.date)}
              remaining={loan.remaining}
            />
          )}

          <section className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-base font-bold">Abonos</h2>
              {loan.paid > 0 && <span className="text-sm font-bold text-income">{formatCurrency(loan.paid)}</span>}
            </div>
            {loan.payments.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-soft">Aún no hay abonos.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {loan.payments.map((payment) => (
                  <LoanEntryRow
                    key={payment.id}
                    kind="payment"
                    loanId={loan.id}
                    entryId={payment.id}
                    title="Abono"
                    meta={dateLabel(payment.date)}
                    amount={formatSignedCurrency(payment.amount)}
                    aside={
                      <span className="text-xs whitespace-nowrap text-ink-soft">
                        {payment.balance > 0 ? `Quedan ${formatCurrency(payment.balance)}` : "Liquidado"}
                      </span>
                    }
                    confirmText={
                      <>
                        ¿Borrar este abono? Lo pendiente vuelve a{" "}
                        <strong>{formatCurrency(loan.remaining + payment.amount)}</strong>.
                      </>
                    }
                  />
                ))}
                <li className="flex items-center gap-3 py-2.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold">{formatCurrency(loan.amount)}</span>
                    <span className="text-xs text-ink-soft">Total prestado</span>
                  </div>
                </li>
              </ul>
            )}
          </section>

          <DeleteLoanButton loanId={loan.id} borrower={loan.borrower} variant="full" />
        </div>
      </div>
    </div>
  );
}
