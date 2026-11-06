"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { deleteLoanAction, saveLoanAction, type LoanFormState } from "@/app/loans/actions";
import { CategoryIcon } from "@/components/CategoryIcon";
import { toDayKey, type DayKey } from "@/lib/dates";
import { formatCurrency, sanitizeAmount } from "@/lib/format";
import { BORROWER_MAX_LENGTH, LOAN_ICON } from "@/lib/loan-constants";
import type { Loan } from "@/lib/loans";

interface LoanFormProps {
  today: DayKey;
  /** Sin `loan` se registra uno nuevo. */
  loan?: Loan;
}

const inputClass =
  "h-12 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder";

export function LoanForm({ today, loan }: LoanFormProps) {
  const [saveState, saveAction, isSaving] = useActionState<LoanFormState, FormData>(saveLoanAction, { error: null });
  const [deleteState, deleteAction, isDeleting] = useActionState<LoanFormState, FormData>(deleteLoanAction, {
    error: null,
  });
  // Controlados: React reinicia los campos no controlados al terminar la acción, incluso si hubo error.
  const [borrower, setBorrower] = useState(loan?.borrower ?? "");
  const [amount, setAmount] = useState(() => loan?.amount.toFixed(2).replace(/\.00$/, "") ?? "");
  const [date, setDate] = useState(() => (loan ? toDayKey(loan.date) : today));
  const [countInTotals, setCountInTotals] = useState(loan?.countInTotals ?? true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const closeHref = loan ? `/loans/${loan.id}` : "/loans";

  return (
    <form action={saveAction} className="flex min-h-full flex-1 flex-col gap-[18px]">
      <input type="hidden" name="loanId" value={loan?.id ?? ""} />

      <div className="flex items-center justify-between">
        <Link
          href={closeHref}
          aria-label="Cerrar"
          className="flex size-11 items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas"
        >
          <X className="size-5" aria-hidden />
        </Link>
        <h1 className="text-[17px] font-bold">{loan ? "Editar préstamo" : "Nuevo préstamo"}</h1>
        <div className="size-11" />
      </div>

      <div className="flex justify-center pt-2" aria-hidden>
        <CategoryIcon category={LOAN_ICON} size="lg" />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold">¿A quién le prestaste?</span>
        <input
          name="borrower"
          required
          maxLength={BORROWER_MAX_LENGTH}
          autoComplete="off"
          value={borrower}
          onChange={(event) => setBorrower(event.target.value)}
          placeholder="Ej. Mi hermano"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold">Monto prestado</span>
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
            className={`${inputClass} w-full pl-7 font-semibold`}
          />
        </span>
        {loan && loan.paid > 0 && (
          <span className="text-xs text-ink-soft">Ya te abonaron {formatCurrency(loan.paid)}.</span>
        )}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold">Fecha del préstamo</span>
        <input
          type="date"
          name="date"
          required
          max={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-control bg-surface p-3.5 shadow-card">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-bold">Contar en mis gastos</span>
          <span className="text-xs text-ink-soft">
            El préstamo aparece como gasto y cada abono como ingreso, con la categoría Préstamos.
          </span>
        </span>
        <input
          type="checkbox"
          name="countInTotals"
          role="switch"
          checked={countInTotals}
          onChange={(event) => setCountInTotals(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-segment transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink-soft after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-full after:bg-surface after:shadow after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      <div className="flex-1" />

      {saveState.error && (
        <p role="alert" className="text-center text-sm font-semibold text-expense">
          {saveState.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving || isDeleting}
        className="h-14 shrink-0 rounded-2xl bg-ink text-base font-bold text-on-ink hover:bg-ink/90 disabled:opacity-60"
      >
        {isSaving ? "Guardando…" : loan ? "Guardar cambios" : "Guardar préstamo"}
      </button>

      {loan &&
        (confirmingDelete ? (
          <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
            <p className="text-sm text-ink">
              ¿Eliminar el préstamo a <strong>{loan.borrower}</strong>? También se borran sus abonos y sus movimientos. No
              se puede deshacer.
            </p>
            {deleteState.error && (
              <p role="alert" className="text-sm font-semibold text-expense">
                {deleteState.error}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="h-11 rounded-control border border-line-strong bg-surface text-sm font-bold text-ink hover:bg-canvas"
              >
                Cancelar
              </button>
              <button
                type="submit"
                formAction={deleteAction}
                formNoValidate
                disabled={isSaving || isDeleting}
                className="h-11 rounded-control bg-expense text-sm font-bold text-on-ink hover:bg-expense/90 disabled:opacity-60"
              >
                {isDeleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="h-11 shrink-0 rounded-control text-sm font-bold text-expense hover:bg-surface"
          >
            Eliminar préstamo
          </button>
        ))}
    </form>
  );
}
