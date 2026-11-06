"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { deleteLoanItemAction, deleteLoanPaymentAction, type LoanFormState } from "@/app/loans/actions";
import { cn } from "@/lib/utils";

interface LoanEntryRowProps {
  kind: "item" | "payment";
  loanId: string;
  entryId: string;
  title: string;
  meta: string;
  /** Monto ya formateado, con el color del tipo. */
  amount: string;
  /** Columna derecha opcional (saldo después del abono). */
  aside?: ReactNode;
  /** Texto de la confirmación de borrado. */
  confirmText: ReactNode;
}

/** Fila de un monto prestado o de un abono, con borrado confirmado en línea. */
export function LoanEntryRow({ kind, loanId, entryId, title, meta, amount, aside, confirmText }: LoanEntryRowProps) {
  const [state, action, isPending] = useActionState<LoanFormState, FormData>(
    kind === "item" ? deleteLoanItemAction : deleteLoanPaymentAction,
    { error: null },
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-col gap-2 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{title}</span>
          <span className="truncate text-xs text-ink-soft">{meta}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={cn("text-sm font-bold whitespace-nowrap", kind === "item" ? "text-expense" : "text-income")}>
            {amount}
          </span>
          {aside}
        </div>
        <button
          type="button"
          aria-label={`Borrar ${kind === "item" ? "monto" : "abono"}: ${title}, ${meta}`}
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
          <input type="hidden" name="entryId" value={entryId} />
          <p role={state.error ? "alert" : undefined} className={cn("min-w-0 flex-1 text-[13px]", state.error && "font-semibold text-expense")}>
            {state.error ?? confirmText}
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
