"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { addLoanItemAction, addLoanPaymentAction, type LoanFormState } from "@/app/loans/actions";
import type { DayKey } from "@/lib/dates";
import { formatCurrency, sanitizeAmount } from "@/lib/format";
import { LOAN_ITEM_CONCEPT_MAX_LENGTH } from "@/lib/loan-constants";

type LoanEntryFormProps = {
  loanId: string;
  today: DayKey;
} & (
  | { kind: "payment"; /** Día del primer monto: no hay abonos antes. */ minDate: DayKey; remaining: number }
  | { kind: "item" }
);

const inputClass =
  "h-12 w-full min-w-0 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder";

/**
 * Agrega un abono o un monto prestado desde el detalle del préstamo. Al guardar, la página le cambia la `key`
 * (número de abonos o de montos) para limpiar los campos. El de montos empieza plegado detrás de un botón.
 */
export function LoanEntryForm(props: LoanEntryFormProps) {
  const isPayment = props.kind === "payment";
  const [state, action, isPending] = useActionState<LoanFormState, FormData>(
    isPayment ? addLoanPaymentAction : addLoanItemAction,
    { error: null },
  );
  const [open, setOpen] = useState(isPayment);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(props.today);
  const remainingText = isPayment ? props.remaining.toFixed(2).replace(/\.00$/, "") : "";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center justify-center gap-1.5 rounded-control border-2 border-dashed border-line-strong text-sm font-bold text-ink-soft hover:bg-canvas"
      >
        <Plus className="size-[18px]" aria-hidden />
        Agregar otro monto
      </button>
    );
  }

  return (
    <form
      action={action}
      className={isPayment ? "flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card" : "flex flex-col gap-3 pt-1"}
    >
      <input type="hidden" name="loanId" value={props.loanId} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 className={isPayment ? "text-base font-bold" : "text-sm font-bold"}>
          {isPayment ? "Registrar abono" : "Nuevo monto"}
        </h2>
        {isPayment && amount !== remainingText && (
          <button
            type="button"
            onClick={() => setAmount(remainingText)}
            className="hit-44 text-[13px] font-bold text-income hover:text-income-hover"
          >
            Liquidar {formatCurrency(props.remaining)}
          </button>
        )}
      </div>

      {!isPayment && (
        <input
          name="concept"
          required
          maxLength={LOAN_ITEM_CONCEPT_MAX_LENGTH}
          autoComplete="off"
          value={concept}
          onChange={(event) => setConcept(event.target.value)}
          placeholder="¿Qué le prestaste? Ej. Préstamo de dinero"
          aria-label="Concepto"
          className={inputClass}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-bold text-ink-soft">Monto</span>
          <span className="relative flex">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] font-semibold text-ink-soft">
              $
            </span>
            <input
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              required
              value={amount}
              onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
              placeholder="0.00"
              aria-invalid={state.error ? true : undefined}
              className={`${inputClass} pl-7 font-semibold`}
            />
          </span>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-bold text-ink-soft">Fecha</span>
          <input
            type="date"
            name="date"
            required
            min={isPayment ? props.minDate : undefined}
            max={props.today}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-expense">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        {!isPayment && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-12 flex-1 rounded-control border border-line-strong bg-surface text-[15px] font-bold hover:bg-canvas"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="h-12 flex-1 rounded-control bg-ink text-[15px] font-bold text-on-ink hover:bg-ink/90 disabled:opacity-60"
        >
          {isPending ? "Guardando…" : isPayment ? "Agregar abono" : "Agregar monto"}
        </button>
      </div>
    </form>
  );
}
