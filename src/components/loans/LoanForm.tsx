"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { saveLoanAction, type LoanFormState } from "@/app/loans/actions";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import type { DayKey } from "@/lib/dates";
import { formatCurrency, sanitizeAmount } from "@/lib/format";
import {
  BORROWER_MAX_LENGTH,
  LOAN_ICON,
  LOAN_ITEM_CONCEPT_MAX_LENGTH,
  MAX_ITEMS_ON_CREATE,
} from "@/lib/loan-constants";
import type { Loan } from "@/lib/loans";

interface LoanFormProps {
  today: DayKey;
  /** Sin `loan` se registra uno nuevo, con sus montos; con `loan` solo se editan la persona y la opción. */
  loan?: Loan;
}

interface ItemDraft {
  key:     number;
  concept: string;
  amount:  string;
  date:    DayKey;
}

const loanInputClass =
  "h-12 w-full min-w-0 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder";

export function LoanForm({ today, loan }: LoanFormProps) {
  const [saveState, saveAction, isSaving] = useActionState<LoanFormState, FormData>(saveLoanAction, { error: null });
  
  // Controlados: React reinicia los campos no controlados al terminar la acción, incluso si hubo error.
  const [borrower, setBorrower] = useState(loan?.borrower ?? "");
  const [countInTotals, setCountInTotals] = useState(loan?.countInTotals ?? true);
  const [items, setItems] = useState<ItemDraft[]>([{ key: 0, concept: "", amount: "", date: today }]);
  const nextKey = useRef(1);

  const closeHref = loan ? `/loans/${loan.id}` : "/loans";
  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  function updateItem(key: number, changes: Partial<ItemDraft>) {
    setItems((current) => current.map((i) => (i.key === key ? { ...i, ...changes } : i)));
  }

  function addItem() {
    setItems((current) => [...current, { key: nextKey.current++, concept: "", amount: "", date: today }]);
  }

  return (
    <form action={saveAction} className="flex min-h-full flex-1 flex-col gap-4.5">
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
          className={loanInputClass}
        />
      </label>

      {!loan && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 flex w-full items-baseline justify-between text-[13px] font-bold">
            ¿Qué le prestaste?
            {items.length > 1 && <span className="font-semibold text-ink-soft">Total {formatCurrency(total)}</span>}
          </legend>

          {items.map((item, index) => (
            <div key={item.key} className="flex flex-col gap-2 rounded-control bg-surface p-3 shadow-card">
              <div className="flex items-center gap-2">
                <input
                  name="itemConcept"
                  required
                  maxLength={LOAN_ITEM_CONCEPT_MAX_LENGTH}
                  autoComplete="off"
                  value={item.concept}
                  onChange={(event) => updateItem(item.key, { concept: event.target.value })}
                  placeholder={index === 0 ? "Ej. Moto" : "Ej. Préstamo de dinero"}
                  aria-label={`Concepto del monto ${index + 1}`}
                  className={loanInputClass}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Quitar monto ${index + 1}`}
                    onClick={() => setItems((current) => current.filter((i) => i.key !== item.key))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-control text-ink-soft hover:bg-canvas hover:text-expense"
                  >
                    <Trash2 className="size-4.5" aria-hidden />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="relative flex">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] font-semibold text-ink-soft">
                    $
                  </span>
                  <input
                    name="itemAmount"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    value={item.amount}
                    onChange={(event) => updateItem(item.key, { amount: sanitizeAmount(event.target.value) })}
                    placeholder="0.00"
                    aria-label={`Monto ${index + 1}`}
                    className={`${loanInputClass} pl-7 font-semibold`}
                  />
                </span>
                <input
                  type="date"
                  name="itemDate"
                  required
                  max={today}
                  value={item.date}
                  onChange={(event) => updateItem(item.key, { date: event.target.value })}
                  aria-label={`Fecha del monto ${index + 1}`}
                  className={loanInputClass}
                />
              </div>
            </div>
          ))}

          {items.length < MAX_ITEMS_ON_CREATE && (
            <button
              type="button"
              onClick={addItem}
              className="flex h-12 items-center justify-center gap-1.5 rounded-control border-2 border-dashed border-line-strong text-sm font-bold text-ink-soft hover:bg-surface"
            >
              <Plus className="size-4.5" aria-hidden />
              Agregar otro monto
            </button>
          )}
        </fieldset>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-control bg-surface p-3.5 shadow-card">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-bold">Contar en mis gastos</span>
          <span className="text-xs text-ink-soft">
            Cada monto aparece como gasto y cada abono como ingreso, con la categoría Préstamos.
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

      { loan && <p className="px-1 text-xs text-ink-soft">Los montos y abonos se agregan o borran desde el detalle del préstamo, igual que el préstamo completo.</p> }

      <div className="flex-1" />

      {
        saveState.error && (
          <p role="alert" className="text-center text-sm font-semibold text-expense">
            {saveState.error}
          </p>
        )
      }

      <button
        type="submit"
        disabled={isSaving}
        className="h-14 shrink-0 rounded-2xl bg-ink text-base font-bold text-on-ink hover:bg-ink/90 disabled:opacity-60"
      >
        {isSaving ? "Guardando…" : loan ? "Guardar cambios" : "Guardar préstamo"}
      </button>
    </form>
  );
}
