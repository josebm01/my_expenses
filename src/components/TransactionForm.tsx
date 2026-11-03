"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { deleteTransactionAction, saveTransactionAction, type TransactionFormState } from "@/app/transactions/actions";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category, TransactionType } from "@/lib/categories";
import { formatShortDate, shiftDay, toDayKey, type DayKey } from "@/lib/dates";
import { formatSignedCurrency } from "@/lib/format";
import type { TransactionOrigin } from "@/lib/navigation";
import type { Transaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";

type DateOption = "today" | "yesterday" | "other";

/** Deja solo dígitos y un punto, con máximo 10 enteros y 2 decimales (cabe en Decimal(12, 2)). */
function sanitizeAmount(value: string): string {
  const [rawWhole, ...rest] = value.replace(/[^\d.]/g, "").split(".");
  const whole = rawWhole.slice(0, 10);
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}

/** Achica la letra conforme crece el monto para que quepa en un iPhone sin cortarse. */
function amountFontSize(length: number): number {
  if (length <= 7) return 52;
  if (length <= 9) return 44;
  if (length <= 11) return 36;
  return 30;
}

function initialDate(today: DayKey, day?: DayKey): { option: DateOption; other: string } {
  if (!day || day === today) return { option: "today", other: "" };
  if (day === shiftDay(today, -1)) return { option: "yesterday", other: "" };
  return { option: "other", other: day };
}

interface TransactionFormProps {
  today: DayKey;
  /** Categorías activas de ambos tipos, ya ordenadas (más la del movimiento si está archivada). */
  categories: Category[];
  /** Sin `transaction` se crea uno nuevo. */
  transaction?: Transaction;
  /** A dónde regresan cerrar, guardar y eliminar. */
  origin?: TransactionOrigin;
  closeHref?: string;
}

export function TransactionForm({ today, categories, transaction, origin = "home", closeHref = "/" }: TransactionFormProps) {
  const [saveState, saveAction, isSaving] = useActionState<TransactionFormState, FormData>(saveTransactionAction, {
    error: null,
  });
  const [deleteState, deleteAction, isDeleting] = useActionState<TransactionFormState, FormData>(
    deleteTransactionAction,
    { error: null },
  );
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const firstOf = (t: TransactionType) => categories.find((c) => c.type === t)?.id ?? "";
  const [categoryId, setCategoryId] = useState(() => transaction?.category.id ?? firstOf("expense"));
  const [amount, setAmount] = useState(() => transaction?.amount.toFixed(2).replace(/\.00$/, "") ?? "");
  const [dateOption, setDateOption] = useState<DateOption>(
    () => initialDate(today, transaction && toDayKey(transaction.date)).option,
  );
  const [otherDate, setOtherDate] = useState(() => initialDate(today, transaction && toDayKey(transaction.date)).other);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isExpense = type === "expense";
  const options = categories.filter((c) => c.type === type);
  const tipo = isExpense ? "gastos" : "ingresos";
  const date = dateOption === "today" ? today : dateOption === "yesterday" ? shiftDay(today, -1) : otherDate;
  const dateOptions: { value: DateOption; label: string }[] = [
    { value: "today", label: `Hoy, ${formatShortDate(today)}` },
    { value: "yesterday", label: "Ayer" },
    { value: "other", label: otherDate ? formatShortDate(otherDate) : "Otra fecha…" },
  ];

  function selectType(next: TransactionType) {
    setType(next);
    setCategoryId(firstOf(next));
  }

  return (
    <form action={saveAction} className="flex min-h-full flex-1 flex-col gap-[18px]">
      <input type="hidden" name="id" value={transaction?.id ?? ""} />
      <input type="hidden" name="from" value={origin} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="date" value={date} />

      <div className="flex items-center justify-between">
        <Link
          href={closeHref}
          aria-label="Cerrar"
          className="flex size-11 items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas"
        >
          <X className="size-5" aria-hidden />
        </Link>
        <h1 className="text-[17px] font-bold">{transaction ? "Editar movimiento" : "Nuevo movimiento"}</h1>
        <div className="size-11" />
      </div>

      <div role="group" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-1 rounded-control bg-segment p-1">
        {(["expense", "income"] as const).map((option) => {
          const active = type === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => selectType(option)}
              className={cn(
                "h-10 rounded-[11px] text-sm font-bold",
                active ? "bg-segment-active shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-ink-soft",
                active && (option === "expense" ? "text-expense" : "text-income"),
              )}
            >
              {option === "expense" ? "Gasto" : "Ingreso"}
            </button>
          );
        })}
      </div>

      <label className="flex flex-col items-center gap-1.5 pt-2 pb-1">
        <span className="text-[13px] font-semibold text-ink-soft">Monto</span>
        <span className={cn("flex max-w-full items-baseline gap-1", isExpense ? "text-expense" : "text-income")}>
          <span className="shrink-0 text-[32px] font-bold">{isExpense ? "−" : "+"}$</span>
          <input
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            required
            value={amount}
            onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
            placeholder="0.00"
            aria-invalid={saveState.error ? true : undefined}
            // El ancho sigue a los caracteres (dígitos tabulares miden 1ch); vacío, al del placeholder.
            style={{ width: `${Math.max(amount.length, 4) + 0.5}ch`, fontSize: amountFontSize(amount.length) }}
            className="max-w-full min-w-0 bg-transparent p-0 font-extrabold tracking-[-0.03em] outline-none placeholder:text-current/35"
          />
        </span>
        <span className="text-xs text-ink-soft">MXN</span>
      </label>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 flex w-full items-baseline justify-between text-[13px] font-bold">
          Categoría
          <Link href={`/categories?tipo=${tipo}`} className="hit-44 text-[13px] font-bold text-income hover:text-income-hover">
            Editar
          </Link>
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {options.map((category) => {
            const active = categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  "flex min-h-[72px] min-w-0 flex-col items-center gap-1.5 rounded-control border-2 bg-surface px-1 py-2.5",
                  active ? "border-ink" : "border-surface",
                )}
              >
                <CategoryIcon category={category} size="sm" />
                <span className="line-clamp-2 max-w-full text-center text-[11px] leading-tight font-semibold break-words hyphens-auto text-ink">
                  {category.name}
                </span>
              </button>
            );
          })}
          <Link
            href={`/categories/new?tipo=${tipo}&desde=nuevo`}
            className="flex min-h-[72px] min-w-0 flex-col items-center gap-1.5 rounded-control border-2 border-dashed border-line-strong px-1 py-2.5 text-ink-soft hover:bg-surface"
          >
            <span className="flex size-9 items-center justify-center">
              <Plus className="size-[19px]" aria-hidden />
            </span>
            <span className="text-[11px] font-semibold">Agregar</span>
          </Link>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-bold">Fecha</legend>
        <div className="flex flex-wrap gap-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={dateOption === option.value}
              onClick={() => setDateOption(option.value)}
              className={cn(
                "h-11 rounded-full border px-4 text-sm font-semibold",
                dateOption === option.value ? "border-ink bg-ink text-on-ink" : "border-line-strong bg-surface text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {dateOption === "other" && (
          <input
            type="date"
            aria-label="Fecha del movimiento"
            required
            max={today}
            value={otherDate}
            onChange={(event) => setOtherDate(event.target.value)}
            className="h-12 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink"
          />
        )}
      </fieldset>

      {transaction?.concept && (
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold">Concepto</span>
          <input
            name="concept"
            maxLength={120}
            defaultValue={transaction.concept}
            className="h-12 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder"
          />
        </label>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold">
          Nota <span className="font-medium text-ink-soft">(opcional)</span>
        </span>
        <input
          name="note"
          maxLength={120}
          defaultValue={transaction?.note ?? ""}
          placeholder="Ej. súper de la semana"
          className="h-12 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder"
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
        {isSaving ? "Guardando…" : transaction ? "Guardar cambios" : isExpense ? "Guardar gasto" : "Guardar ingreso"}
      </button>

      {transaction &&
        (confirmingDelete ? (
          <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
            <p className="text-sm text-ink">
              ¿Eliminar <strong>{transaction.concept ?? transaction.note ?? transaction.category.name}</strong> por{" "}
              <strong className="whitespace-nowrap">
                {formatSignedCurrency(transaction.type === "expense" ? -transaction.amount : transaction.amount)}
              </strong>
              ? No se puede deshacer.
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
            Eliminar movimiento
          </button>
        ))}
    </form>
  );
}
