"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { dayKeyToDate, parseDayKey, toDayKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { BORROWER_MAX_LENGTH } from "@/lib/loan-constants";
import {
  addLoanPayment,
  createLoan,
  deleteLoan,
  deleteLoanPayment,
  getLoan,
  updateLoan,
} from "@/lib/loans";

export interface LoanFormState {
  error: string | null;
}

const MAX_AMOUNT = 9_999_999_999.99; // Decimal(12, 2)

function parseAmount(formData: FormData): number {
  const amount = Number(String(formData.get("amount") ?? "").replace(/,/g, ""));
  return Math.round(amount * 100) / 100;
}

function amountError(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Escribe un monto mayor a cero.";
  if (amount > MAX_AMOUNT) return "El monto es demasiado grande.";
  return null;
}

async function findLoan(formData: FormData) {
  const id = formData.get("loanId");
  return typeof id === "string" && id ? getLoan(id) : null;
}

export async function saveLoanAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const existing = await findLoan(formData);
  if (formData.get("loanId") && !existing) return { error: "Este préstamo ya no existe." };

  const borrower = String(formData.get("borrower") ?? "").trim().replace(/\s+/g, " ");
  const amount = parseAmount(formData);
  const day = parseDayKey(formData.get("date"));
  const countInTotals = formData.get("countInTotals") === "on";

  if (!borrower) return { error: "Escribe a quién le prestaste." };
  if (borrower.length > BORROWER_MAX_LENGTH) return { error: "El nombre es demasiado largo." };
  const invalidAmount = amountError(amount);
  if (invalidAmount) return { error: invalidAmount };
  if (existing && amount < existing.paid) {
    return { error: `Ya te abonaron ${formatCurrency(existing.paid)}; el préstamo no puede ser menor.` };
  }
  if (!day) return { error: "Elige una fecha válida." };

  const input = {
    borrower,
    amount,
    countInTotals,
    // Si la fecha no cambió se conserva el instante original.
    date: existing && toDayKey(existing.date) === day ? existing.date : dayKeyToDate(day),
  };
  const id = existing ? existing.id : await createLoan(input);
  if (existing) await updateLoan(existing.id, input);
  redirect(`/loans/${id}`);
}

export async function deleteLoanAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  if (!loan) return { error: "Este préstamo ya no existe." };

  await deleteLoan(loan.id);
  redirect("/loans");
}

export async function addLoanPaymentAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  if (!loan) return { error: "Este préstamo ya no existe." };

  const amount = parseAmount(formData);
  const day = parseDayKey(formData.get("date"));

  const invalidAmount = amountError(amount);
  if (invalidAmount) return { error: invalidAmount };
  if (amount > loan.remaining) {
    return {
      error:
        loan.remaining > 0
          ? `El abono es mayor a lo pendiente (${formatCurrency(loan.remaining)}).`
          : "Este préstamo ya está liquidado.",
    };
  }
  if (!day) return { error: "Elige una fecha válida." };
  if (day < toDayKey(loan.date)) return { error: "El abono no puede ser anterior al préstamo." };

  await addLoanPayment(loan, { amount, date: dayKeyToDate(day) });
  refresh();
  return { error: null };
}

export async function deleteLoanPaymentAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  const paymentId = formData.get("paymentId");
  if (!loan || typeof paymentId !== "string") return { error: "Este abono ya no existe." };

  await deleteLoanPayment(loan.id, paymentId);
  refresh();
  return { error: null };
}
