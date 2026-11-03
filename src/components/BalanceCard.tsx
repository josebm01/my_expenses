"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useTransactionTypeFilter } from "@/components/TransactionTypeFilter";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { MonthTotals } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-white/70";

/**
 * Tarjeta oscura de balance (móvil). En escritorio se usa `KpiCards`.
 * Ingresos/Gastos filtran "Últimos movimientos"; tocar el balance quita el filtro.
 */
export function BalanceCard({ totals, className }: { totals: MonthTotals; className?: string }) {
  const { income, expenses, balance, savingsRate } = totals;
  const { filter, setFilter, toggle } = useTransactionTypeFilter();
  const tile = cn("flex cursor-pointer flex-col gap-1 rounded-control bg-night p-3 text-left", focusRing);

  return (
    <section
      role="group"
      aria-label="Filtrar últimos movimientos"
      className={cn("flex flex-col gap-4 rounded-card bg-ink p-5 text-white", className)}
    >
      <button
        type="button"
        aria-pressed={filter === "all"}
        onClick={() => setFilter("all")}
        className={cn("-m-1 flex cursor-pointer flex-col gap-1 rounded-control p-1 text-left", focusRing)}
      >
        <span className="text-[13px] font-medium text-night-muted">Balance del mes</span>
        <span className="text-[38px] leading-tight font-extrabold tracking-[-0.03em]">{formatCurrency(balance)}</span>
        {savingsRate !== null && (
          <span className="text-xs text-night-muted">
            {savingsRate >= 0
              ? `Ahorras el ${formatPercent(savingsRate)} de tus ingresos`
              : "Gastaste más de lo que ingresaste"}
          </span>
        )}
      </button>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          aria-pressed={filter === "income"}
          onClick={() => toggle("income")}
          className={cn(tile, filter === "income" && "ring-2 ring-income-on-dark")}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-night-muted">
            <ArrowDownLeft className="size-4 text-income-on-dark" strokeWidth={2.4} aria-hidden />
            Ingresos
          </span>
          <span className="text-lg font-bold">{formatCurrency(income)}</span>
        </button>
        <button
          type="button"
          aria-pressed={filter === "expense"}
          onClick={() => toggle("expense")}
          className={cn(tile, filter === "expense" && "ring-2 ring-expense-on-dark")}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-night-muted">
            <ArrowUpRight className="size-4 text-expense-on-dark" strokeWidth={2.4} aria-hidden />
            Gastos
          </span>
          <span className="text-lg font-bold">{formatCurrency(expenses)}</span>
        </button>
      </div>
    </section>
  );
}
