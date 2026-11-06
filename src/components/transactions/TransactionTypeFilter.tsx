"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { TransactionType } from "@/lib/categories";

export type TransactionTypeFilterValue = "all" | TransactionType;

interface FilterContext {
  filter: TransactionTypeFilterValue;
  setFilter: (filter: TransactionTypeFilterValue) => void;
}

const Context = createContext<FilterContext | null>(null);

/**
 * Filtro del dashboard: las tarjetas de Ingresos/Gastos eligen qué movimientos se ven y Balance vuelve a "todos".
 * Vive en el cliente (no en la URL) para no re-suspender la página en cada clic: el servidor ya mandó las tres listas.
 */
export function TransactionTypeFilter({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<TransactionTypeFilterValue>("all");
  return <Context value={{ filter, setFilter }}>{children}</Context>;
}

export function useTransactionTypeFilter(): FilterContext & {
  /** Elegir el filtro activo otra vez lo quita. */
  toggle: (filter: TransactionTypeFilterValue) => void;
} {
  const context = useContext(Context);
  if (!context) throw new Error("useTransactionTypeFilter debe usarse dentro de <TransactionTypeFilter>");
  const { filter, setFilter } = context;
  return { filter, setFilter, toggle: (next) => setFilter(next === filter ? "all" : next) };
}
