"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteLoanAction, type LoanFormState } from "@/app/loans/actions";
import { cn } from "@/lib/utils";

interface DeleteLoanButtonProps {
  loanId: string;
  borrower: string;
  /** `icon`: bote junto a la tarjeta de la lista (el contenedor debe ser `flex flex-wrap`); `full`: botón de texto. */
  variant: "icon" | "full";
}

/** Borra el préstamo con sus montos, abonos y los movimientos que generaron, tras confirmar. */
export function DeleteLoanButton({ loanId, borrower, variant }: DeleteLoanButtonProps) {
  const [state, action, isPending] = useActionState<LoanFormState, FormData>(deleteLoanAction, { error: null });
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          aria-label={`Eliminar préstamo a ${borrower}`}
          aria-expanded={confirming}
          onClick={() => setConfirming((value) => !value)}
          className="m-2 ml-0 flex size-11 shrink-0 items-center justify-center rounded-control text-ink-soft hover:bg-canvas hover:text-expense"
        >
          <Trash2 className="size-[18px]" aria-hidden />
        </button>
      ) : (
        !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-11 shrink-0 rounded-control text-sm font-bold text-expense hover:bg-surface"
          >
            Eliminar préstamo
          </button>
        )
      )}

      {confirming && (
        <form
          action={action}
          className={cn(
            "flex basis-full flex-col gap-3",
            variant === "icon" ? "border-t border-line p-4" : "rounded-card bg-surface p-4 shadow-card",
          )}
        >
          <input type="hidden" name="loanId" value={loanId} />
          <p className="text-sm text-ink">
            ¿Eliminar el préstamo a <strong>{borrower}</strong>? Se borran todos sus montos y abonos, y dejan de contar en
            tus gastos e ingresos. No se puede deshacer.
          </p>
          {state.error && (
            <p role="alert" className="text-sm font-semibold text-expense">
              {state.error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-11 rounded-control border border-line-strong bg-surface text-sm font-bold text-ink hover:bg-canvas"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-control bg-expense text-sm font-bold text-on-ink hover:bg-expense/90 disabled:opacity-60"
            >
              {isPending ? "Eliminando…" : "Sí, eliminar"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
