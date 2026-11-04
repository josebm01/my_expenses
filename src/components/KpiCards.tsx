"use client";

import { useTransactionTypeFilter } from "@/components/TransactionTypeFilter";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { MonthTotals } from "@/lib/transactions";
import { cn } from "@/lib/utils";

/** Fila de indicadores del dashboard de escritorio. Ingresos/Gastos filtran "Últimos movimientos"; Balance quita el filtro. */
export function KpiCards({ totals, className }: { totals: MonthTotals; className?: string }) {
  const { income, expenses, balance, savingsRate } = totals;
  const { filter, setFilter, toggle } = useTransactionTypeFilter();
  const tile = "flex flex-col gap-1.5 rounded-panel p-5 shadow-card";
  const button = cn(
    tile,
    "cursor-pointer text-left outline-none ring-offset-2 ring-offset-canvas transition-shadow",
    "focus-visible:ring-2 focus-visible:ring-ink-soft",
  );
  const label = "text-[13px] font-semibold";
  const value = "text-[26px] font-extrabold";

  return (
    <div role="group" aria-label="Filtrar últimos movimientos" className={cn("grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4", className)}>
      <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={cn(button, "bg-panel text-white")}>
        <span className={cn(label, "text-night-muted")}>Balance del mes</span>
        <span className={cn("text-[30px] font-extrabold tracking-[-0.02em]", balance < 0 && "text-negative-on-dark")}>
          {formatCurrency(balance)}
        </span>
      </button>
      <button
        type="button"
        aria-pressed={filter === "income"}
        onClick={() => toggle("income")}
        className={cn(button, "bg-surface hover:shadow-card-hover", filter === "income" && "ring-2 ring-income")}
      >
        <span className={cn(label, "text-ink-soft")}>Ingresos</span>
        <span className={cn(value, "text-income")}>{formatCurrency(income)}</span>
      </button>
      <button
        type="button"
        aria-pressed={filter === "expense"}
        onClick={() => toggle("expense")}
        className={cn(button, "bg-surface hover:shadow-card-hover", filter === "expense" && "ring-2 ring-expense")}
      >
        <span className={cn(label, "text-ink-soft")}>Gastos</span>
        <span className={cn(value, "text-expense")}>{formatCurrency(expenses)}</span>
      </button>
      <div className={cn(tile, "bg-surface")}>
        <span className={cn(label, "text-ink-soft")}>Tasa de ahorro</span>
        <span className={value}>{savingsRate === null ? "—" : formatPercent(savingsRate)}</span>
      </div>
    </div>
  );
}
