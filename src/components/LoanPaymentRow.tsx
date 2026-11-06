"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteLoanPaymentAction, type LoanFormState } from "@/app/loans/actions";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";

interface LoanPaymentRowProps {
  loanId: string;
  paymentId: string;
  amount: number;
  /** Fecha ya formateada ("12 nov 2026"). */
  dateLabel: string;
  /** Saldo pendiente después del abono. */
  balance: number;
}

export function LoanPaymentRow({ loanId, paymentId, amount, dateLabel, balance }: LoanPaymentRowProps) {
  const [state, action, isPending] = useActionState<LoanFormState, FormData>(deleteLoanPaymentAction, { error: null });
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-col gap-2 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-bold text-income">{formatSignedCurrency(amount)}</span>
          <span className="truncate text-xs text-ink-soft">Abono · {dateLabel}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold whitespace-nowrap">{formatCurrency(balance)}</span>
          <span className="text-xs text-ink-soft">{balance > 0 ? "pendiente" : "liquidado"}</span>
        </div>
        <button
          type="button"
          aria-label={`Borrar abono de ${formatCurrency(amount)} del ${dateLabel}`}
          aria-expanded={confirming}
          onClick={() => setConfirming((value) => !value)}
          className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-control text-ink-soft hover:bg-canvas hover:text-expense"
        >
          <Trash2 className="size-[18px]" aria-hidden />
        </button>
      </div>

      {confirming && (
        <form action={action} className="flex flex-wrap items-center gap-2 rounded-control bg-canvas p-2.5">
          <input type="hidden" name="loanId" value={loanId} />
          <input type="hidden" name="paymentId" value={paymentId} />
          <p className="min-w-0 flex-1 text-[13px]">
            {state.error ?? (
              <>
                ¿Borrar este abono? El saldo vuelve a <strong>{formatCurrency(balance + amount)}</strong>.
              </>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3.5 text-sm font-bold hover:bg-canvas"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-control bg-expense px-3.5 text-sm font-bold text-on-ink hover:bg-expense/90 disabled:opacity-60"
            >
              {isPending ? "Borrando…" : "Borrar"}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
