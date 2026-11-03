"use server";

import { redirect } from "next/navigation";
import { getActiveCategory } from "@/lib/categories";
import { dayKeyToDate, parseDayKey, toDayKey } from "@/lib/dates";
import { transactionOriginHref } from "@/lib/navigation";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  updateTransaction,
  type TransactionInput,
} from "@/lib/transactions";

export interface TransactionFormState {
  error: string | null;
}

const MAX_AMOUNT = 9_999_999_999.99; // Decimal(12, 2)

async function findTransaction(formData: FormData) {
  const id = formData.get("id");
  return typeof id === "string" && id ? getTransaction(id) : null;
}

/** Las altas regresan a Inicio; las ediciones, a donde se abrieron. */
function origin(formData: FormData) {
  return formData.get("from") === "transactions" ? "transactions" : "home";
}

export async function saveTransactionAction(
  _previous: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const existing = await findTransaction(formData);
  if (formData.get("id") && !existing) return { error: "Este movimiento ya no existe." };

  const type = formData.get("type");
  const categoryId = formData.get("categoryId");
  const day = parseDayKey(formData.get("date"));
  const amount = Number(String(formData.get("amount") ?? "").replace(/,/g, ""));
  const note = String(formData.get("note") ?? "").trim().slice(0, 120) || null;
  // Solo los movimientos importados traen concepto; el campo aparece únicamente al editarlos.
  const concept = formData.has("concept") ? String(formData.get("concept")).trim().slice(0, 120) || null : undefined;

  if (type !== "expense" && type !== "income") return { error: "Elige si es gasto o ingreso." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Escribe un monto mayor a cero." };
  if (amount > MAX_AMOUNT) return { error: "El monto es demasiado grande." };
  // Al editar se permite conservar la categoría aunque ya esté archivada.
  const category =
    existing && categoryId === existing.category.id
      ? existing.category
      : typeof categoryId === "string"
        ? await getActiveCategory(categoryId)
        : null;
  if (category?.type !== type) return { error: "Elige una categoría." };
  if (!day) return { error: "Elige una fecha válida." };

  const input: TransactionInput = {
    type,
    amount: Math.round(amount * 100) / 100,
    categoryId: category.id,
    concept,
    note,
    // Si la fecha no cambió se conserva el instante original.
    date: existing && toDayKey(existing.date) === day ? existing.date : dayKeyToDate(day),
  };
  if (existing) {
    await updateTransaction(existing.id, input);
  } else {
    await createTransaction(input);
  }
  redirect(transactionOriginHref(origin(formData), day));
}

export async function deleteTransactionAction(
  _previous: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const transaction = await findTransaction(formData);
  if (!transaction) return { error: "Este movimiento ya no existe." };

  await deleteTransaction(transaction.id);
  redirect(transactionOriginHref(origin(formData), toDayKey(transaction.date)));
}
