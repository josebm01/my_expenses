"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { dayKeyToDate, parseDayKey, toDayKey, todayKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { BORROWER_MAX_LENGTH, LOAN_ITEM_CONCEPT_MAX_LENGTH, MAX_ITEMS_ON_CREATE } from "@/lib/loan-constants";
import {
  addLoanItem,
  addLoanPayment,
  createLoan,
  deleteLoan,
  deleteLoanItem,
  deleteLoanPayment,
  getLoan,
  updateLoan,
  type LoanItemInput,
} from "@/lib/loans";

export interface LoanFormState {
  error: string | null;
}

const MAX_AMOUNT = 9_999_999_999.99; // Decimal(12, 2)

function parseAmount(value: FormDataEntryValue | null): number {
  const amount = Number(String(value ?? "").replace(/,/g, ""));
  return Math.round(amount * 100) / 100;
}

function amountError(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Escribe un monto mayor a cero.";
  if (amount > MAX_AMOUNT) return "El monto es demasiado grande.";
  return null;
}

function cleanText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/** Valida un monto prestado; `position` numera el error cuando el formulario trae varios. */
function parseItem(
  concept:   FormDataEntryValue | null,
  amount:    FormDataEntryValue | null,
  date:      FormDataEntryValue | null,
  position?: number,
): { item: LoanItemInput } | { error: string } {
  
  const prefix = position ? `Monto ${position}: ` : "";
  const text = cleanText(concept);
  const value = parseAmount(amount);
  const day = parseDayKey(date);

  if (!text) return { error: `${prefix}escribe qué le prestaste.` };
  if (text.length > LOAN_ITEM_CONCEPT_MAX_LENGTH) return { error: `${prefix}el concepto es demasiado largo.` };
  
  const invalidAmount = amountError(value);
  if (invalidAmount) return { error: prefix + invalidAmount };
  if (!day || day > todayKey()) return { error: `${prefix}elige una fecha válida.` };

  return { item: { concept: text, amount: value, date: dayKeyToDate(day) } };
}

async function findLoan(formData: FormData) {
  const id = formData.get("loanId");
  return typeof id === "string" && id ? getLoan(id) : null;
}

/** Alta: persona, opción y uno o varios montos. Edición: solo persona y opción (los montos se cambian en el detalle). */
export async function saveLoanAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const existing = await findLoan(formData);
  if (formData.get("loanId") && !existing) return { error: "Este préstamo ya no existe." };

  const borrower = cleanText(formData.get("borrower"));
  const countInTotals = formData.get("countInTotals") === "on";
  if (!borrower) return { error: "Escribe a quién le prestaste." };
  if (borrower.length > BORROWER_MAX_LENGTH) return { error: "El nombre es demasiado largo." };

  if (existing) {
    await updateLoan(existing.id, { borrower, countInTotals });
    redirect(`/loans/${existing.id}`);
  }

  const concepts = formData.getAll("itemConcept");
  const amounts  = formData.getAll("itemAmount");
  const dates    = formData.getAll("itemDate");

  if (concepts.length === 0) return { error: "Agrega al menos un monto." };
  if (concepts.length > MAX_ITEMS_ON_CREATE) return { error: "Son demasiados montos; agrega el resto después." };

  const items: LoanItemInput[] = [];
  for (let i = 0; i < concepts.length; i++) {
    const parsed = parseItem(concepts[i], amounts[i] ?? null, dates[i] ?? null, concepts.length > 1 ? i + 1 : undefined);
    if ("error" in parsed) return { error: parsed.error };
    items.push(parsed.item);
  }

  const id = await createLoan({ borrower, countInTotals, items });
  redirect(`/loans/${id}`);
}

export async function deleteLoanAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  if (!loan) return { error: "Este préstamo ya no existe." };

  await deleteLoan(loan.id);
  redirect("/loans");
}

export async function addLoanItemAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  if (!loan) return { error: "Este préstamo ya no existe." };

  const parsed = parseItem(formData.get("concept"), formData.get("amount"), formData.get("date"));
  if ("error" in parsed) return { error: parsed.error.charAt(0).toUpperCase() + parsed.error.slice(1) };

  await addLoanItem(loan, parsed.item);
  refresh();
  return { error: null };
}

export async function deleteLoanItemAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  const item = loan?.items.find((i) => i.id === formData.get("entryId"));
  
  if (!loan || !item) return { error: "Este monto ya no existe." };
  if (loan.items.length === 1) return { error: "Es el único monto; si ya no aplica, elimina el préstamo." };
  if (loan.amount - item.amount < loan.paid) {
    return { error: `Ya te abonaron ${formatCurrency(loan.paid)}; sin este monto el préstamo quedaría por debajo.` };
  }

  await deleteLoanItem(loan.id, item.id);
  refresh();
  return { error: null };
}

export async function addLoanPaymentAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  if (!loan) return { error: "Este préstamo ya no existe." };

  const amount = parseAmount(formData.get("amount"));
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
  if (!day || day > todayKey()) return { error: "Elige una fecha válida." };
  if (day < toDayKey(loan.date)) return { error: "El abono no puede ser anterior al préstamo." };

  await addLoanPayment(loan, { amount, date: dayKeyToDate(day) });
  refresh();
  return { error: null };
}

export async function deleteLoanPaymentAction(_previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  await requireUser();
  const loan = await findLoan(formData);
  const paymentId = formData.get("entryId");
  
  if (!loan || typeof paymentId !== "string") return { error: "Este abono ya no existe." };

  await deleteLoanPayment(loan.id, paymentId);
  refresh();
  return { error: null };
}
