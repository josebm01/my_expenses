"use client";

import { useActionState, useState } from "react";
import { addLoanPaymentAction, type LoanFormState } from "@/app/loans/actions";
import type { DayKey } from "@/lib/dates";
import { formatCurrency, sanitizeAmount } from "@/lib/format";

interface LoanPaymentFormProps {
  loanId: string;
  today: DayKey;
  /** Día del préstamo: no hay abonos antes. */
  minDate: DayKey;
  remaining: number;
}

const inputClass =
  "h-12 w-full rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder";

/** Al guardar, la página le cambia la `key` (número de abonos) para limpiar los campos. */
export function LoanPaymentForm({ loanId, today, minDate, remaining }: LoanPaymentFormProps) {
  const [state, action, isPending] = useActionState<LoanFormState, FormData>(addLoanPaymentAction, { error: null });
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const remainingText = remaining.toFixed(2).replace(/\.00$/, "");

  return (
    <form action={action} className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <input type="hidden" name="loanId" value={loanId} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">Registrar abono</h2>
        {amount !== remainingText && (
          <button
            type="button"
            onClick={() => setAmount(remainingText)}
            className="hit-44 text-[13px] font-bold text-income hover:text-income-hover"
          >
            Liquidar {formatCurrency(remaining)}
          </button>
        )}
      </div>

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
            min={minDate}
            max={today}
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

      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-control bg-ink text-[15px] font-bold text-on-ink hover:bg-ink/90 disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Agregar abono"}
      </button>
    </form>
  );
}
