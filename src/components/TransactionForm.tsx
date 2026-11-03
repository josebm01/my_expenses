"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createTransactionAction, type CreateTransactionState } from "@/app/new/actions";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category, TransactionType } from "@/lib/categories";
import { formatShortDate, shiftDay, type DayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DateOption = "today" | "yesterday" | "other";

/** Deja solo dígitos y un punto con máximo 2 decimales. */
function sanitizeAmount(value: string): string {
  const [whole, ...rest] = value.replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}

interface TransactionFormProps {
  today: DayKey;
  /** Categorías activas de ambos tipos, ya ordenadas. */
  categories: Category[];
}

export function TransactionForm({ today, categories }: TransactionFormProps) {
  const [state, formAction, isPending] = useActionState<CreateTransactionState, FormData>(createTransactionAction, {
    error: null,
  });
  const [type, setType] = useState<TransactionType>("expense");
  const firstOf = (t: TransactionType) => categories.find((c) => c.type === t)?.id ?? "";
  const [categoryId, setCategoryId] = useState(() => firstOf("expense"));
  const [amount, setAmount] = useState("");
  const [dateOption, setDateOption] = useState<DateOption>("today");
  const [otherDate, setOtherDate] = useState("");

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
    <form action={formAction} className="flex min-h-full flex-1 flex-col gap-[18px]">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="date" value={date} />

      <div className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Cerrar"
          className="flex size-11 items-center justify-center rounded-icon border border-line bg-white text-ink hover:bg-canvas"
        >
          <X className="size-5" aria-hidden />
        </Link>
        <h1 className="text-[17px] font-bold">Nuevo movimiento</h1>
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
                active ? "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-ink-soft",
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
        <span className={cn("flex items-baseline gap-1", isExpense ? "text-expense" : "text-income")}>
          <span className="text-[32px] font-bold">{isExpense ? "−" : "+"}$</span>
          <input
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            required
            value={amount}
            onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
            placeholder="0.00"
            aria-invalid={state.error ? true : undefined}
            className="w-[220px] bg-transparent p-0 text-[52px] font-extrabold tracking-[-0.03em] outline-none placeholder:text-current/35"
          />
        </span>
        <span className="text-xs text-ink-soft">MXN</span>
      </label>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 flex w-full items-baseline justify-between text-[13px] font-bold">
          Categoría
          <Link href={`/categories?tipo=${tipo}`} className="hit-44 text-[13px] font-bold text-income hover:text-[#08506A]">
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
                  "flex min-h-[72px] min-w-0 flex-col items-center gap-1.5 rounded-control border-2 bg-white px-1 py-2.5",
                  active ? "border-ink" : "border-white",
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
            className="flex min-h-[72px] min-w-0 flex-col items-center gap-1.5 rounded-control border-2 border-dashed border-line-strong px-1 py-2.5 text-ink-soft hover:bg-white"
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
                dateOption === option.value ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink",
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
            className="h-12 rounded-control border border-line-strong bg-white px-3.5 text-[15px] text-ink"
          />
        )}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold">
          Nota <span className="font-medium text-ink-soft">(opcional)</span>
        </span>
        <input
          name="note"
          maxLength={120}
          placeholder="Ej. súper de la semana"
          className="h-12 rounded-control border border-line-strong bg-white px-3.5 text-[15px] text-ink placeholder:text-[#7A808C]"
        />
      </label>

      <div className="flex-1" />

      {state.error && (
        <p role="alert" className="text-center text-sm font-semibold text-expense">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-14 rounded-2xl bg-ink text-base font-bold text-white hover:bg-ink/90 disabled:opacity-60"
      >
        {isPending ? "Guardando…" : isExpense ? "Guardar gasto" : "Guardar ingreso"}
      </button>
    </form>
  );
}
