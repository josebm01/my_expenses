"use client";

import type { ReactNode } from "react";
import { useTransactionTypeFilter, type TransactionTypeFilterValue } from "@/components/TransactionTypeFilter";

/** Muestra `children` solo cuando el filtro del dashboard es `value`. */
export function TransactionTypeView({ value, children }: { value: TransactionTypeFilterValue; children: ReactNode }) {
  const { filter } = useTransactionTypeFilter();
  return filter === value ? children : null;
}
