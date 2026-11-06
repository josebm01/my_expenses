import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronLeft, Pencil } from "lucide-react";
import { FormPageContainer } from "@/components/FormPageContainer";
import { LoanPaymentForm } from "@/components/LoanPaymentForm";
import { LoanPaymentRow } from "@/components/LoanPaymentRow";
import { LoanProgress } from "@/components/LoanProgress";
import { PageSkeleton } from "@/components/PageSkeleton";
import { formatShortDateWithYear, toDayKey, todayKey } from "@/lib/dates";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getLoan } from "@/lib/loans";

export const metadata: Metadata = { title: "Préstamo · Mis Gastos" };

const iconButton =
  "flex size-11 items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas";

export default function LoanPage({ params }: PageProps<"/loans/[id]">) {
  return (
    <FormPageContainer>
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

  const loanDay = toDayKey(loan.date);
  const settled = loan.remaining <= 0;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between gap-3">
        <Link href="/loans" aria-label="Volver a Préstamos" className={iconButton}>
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="min-w-0 truncate text-[17px] font-bold">Préstamo a {loan.borrower}</h1>
        <Link href={`/loans/${loan.id}/edit`} aria-label="Editar préstamo" className={iconButton}>
          <Pencil className="size-[18px]" aria-hidden />
        </Link>
      </div>

      <section className="flex flex-col gap-3 rounded-card bg-panel p-5 text-white shadow-card">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-night-muted">{settled ? "Liquidado" : "Por cobrar"}</span>
          <span className="text-[38px] leading-tight font-extrabold tracking-[-0.03em]">
            {formatCurrency(Math.max(loan.remaining, 0))}
          </span>
        </div>
        <LoanProgress loan={loan} onDark />
        <span className="text-xs text-night-muted">
          Cobrado {formatCurrency(loan.paid)} de {formatCurrency(loan.amount)} ·{" "}
          {formatPercent(loan.amount > 0 ? (loan.paid / loan.amount) * 100 : 0)}
        </span>
      </section>

      <p className="px-1 text-xs text-ink-soft">
        {loan.countInTotals
          ? "Cuenta en tus totales: el préstamo es un gasto y cada abono un ingreso, en la categoría Préstamos."
          : "No cuenta en tus gastos ni ingresos; solo se lleva aquí."}{" "}
        <Link href={`/loans/${loan.id}/edit`} className="hit-44 font-bold text-income hover:text-income-hover">
          Cambiar
        </Link>
      </p>

      {!settled && (
        <LoanPaymentForm
          key={loan.payments.length}
          loanId={loan.id}
          today={todayKey()}
          minDate={loanDay}
          remaining={loan.remaining}
        />
      )}

      <section className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card">
        <h2 className="text-base font-bold">Historial</h2>
        <ul className="flex flex-col divide-y divide-line">
          {loan.payments.map((payment) => (
            <LoanPaymentRow
              key={payment.id}
              loanId={loan.id}
              paymentId={payment.id}
              amount={payment.amount}
              dateLabel={formatShortDateWithYear(toDayKey(payment.date))}
              balance={payment.balance}
            />
          ))}
          <li className="flex items-center gap-3 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-bold text-expense">{formatCurrency(loan.amount)}</span>
              <span className="truncate text-xs text-ink-soft">Préstamo · {formatShortDateWithYear(loanDay)}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-semibold whitespace-nowrap">{formatCurrency(loan.amount)}</span>
              <span className="text-xs text-ink-soft">pendiente</span>
            </div>
            {/* Alinea con las filas de abono, que llevan el botón de borrar. */}
            <span className="-mr-2 size-11 shrink-0" aria-hidden />
          </li>
        </ul>
      </section>
    </div>
  );
}
