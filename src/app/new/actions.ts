"use server";

import { redirect } from "next/navigation";
import { getActiveCategory } from "@/lib/categories";
import { dayKeyToDate, parseDayKey, todayKey } from "@/lib/dates";
import { createTransaction } from "@/lib/transactions";

export interface CreateTransactionState {
  error: string | null;
}

const MAX_AMOUNT = 9_999_999_999.99; // Decimal(12, 2)

export async function createTransactionAction(
  _previous: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  const type = formData.get("type");
  const categoryId = formData.get("categoryId");
  const day = parseDayKey(formData.get("date"));
  const amount = Number(String(formData.get("amount") ?? "").replace(/,/g, ""));
  const note = String(formData.get("note") ?? "").trim().slice(0, 120) || null;

  if (type !== "expense" && type !== "income") return { error: "Elige si es gasto o ingreso." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Escribe un monto mayor a cero." };
  if (amount > MAX_AMOUNT) return { error: "El monto es demasiado grande." };
  const category = typeof categoryId === "string" ? await getActiveCategory(categoryId) : null;
  if (category?.type !== type) return { error: "Elige una categoría." };
  if (!day) return { error: "Elige una fecha válida." };

  await createTransaction({
    type,
    amount: Math.round(amount * 100) / 100,
    categoryId: category.id,
    note,
    date: dayKeyToDate(day),
  });

  const month = day.slice(0, 7);
  redirect(month === todayKey().slice(0, 7) ? "/" : `/?mes=${month}`);
}
