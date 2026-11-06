import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { LOAN_CATEGORY_ID, LOAN_REPAYMENT_CATEGORY_ID } from "./categories";
import { prisma } from "./prisma";
import { isUuid } from "./transactions";

// Préstamos que hice yo: a una persona le presto uno o varios montos ("Moto", "Préstamo de dinero")
// y me va abonando al total. Si `countInTotals` está activo, se reflejan como movimientos (un gasto por
// monto y un ingreso por abono, categorías "Préstamos") para que Inicio, Movimientos y Resumen los cuenten.

export interface LoanItem {
  id:      string;
  concept: string;
  amount:  number;
  date:    Date;
}

export interface LoanPayment {
  id:      string;
  amount:  number;
  date:    Date;  
  balance: number; /** Lo que quedaba por cobrar del total después de este abono. */
}

export interface Loan {
  id:            string;
  borrower:      string;
  countInTotals: boolean;
  amount:        number; /** Suma de los montos prestados. */
  date:          Date; /** Fecha del primer monto. */
  paid:          number; /** Suma de los abonos. */
  remaining:     number; /** Lo que falta por cobrar. */
  items:         LoanItem[]; /** Del más antiguo al más reciente. */
  payments:      LoanPayment[]; /** Del más reciente al más antiguo. */
}

export interface LoanItemInput {
  concept: string;
  amount:  number;
  date:    Date;
}

export interface LoanPaymentInput {
  amount: number;
  date:   Date;
}

const oldestFirst = [{ date: "asc" }, { createdAt: "asc" }] satisfies Prisma.LoanItemOrderByWithRelationInput[];
const withEntries = {
  items: { orderBy: oldestFirst },
  payments: { orderBy: oldestFirst },
} satisfies Prisma.LoanInclude;

type LoanRecord = Prisma.LoanGetPayload<{ include: typeof withEntries }>;
type Tx = Prisma.TransactionClient;

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Los abonos se recorren en orden para ir restándolos del total prestado. */
function toLoan(record: LoanRecord): Loan {
  const items = record.items.map((i) => ({ id: i.id, concept: i.concept, amount: i.amount.toNumber(), date: i.date }));
  const amount = roundCents(items.reduce((sum, i) => sum + i.amount, 0));
  let balance = amount;
  const payments = record.payments.map((p) => {
    const value = p.amount.toNumber();
    balance = roundCents(balance - value);
    return { id: p.id, amount: value, date: p.date, balance };
  });
  return {
    id: record.id,
    borrower: record.borrower,
    countInTotals: record.countInTotals,
    amount,
    date: items[0]?.date ?? record.createdAt,
    paid: roundCents(amount - balance),
    remaining: balance,
    items,
    payments: payments.reverse(),
  };
}

/** Pendientes primero; dentro de cada grupo, el más reciente arriba. */
export async function getLoans(): Promise<Loan[]> {
  const records = await prisma.loan.findMany({ include: withEntries, orderBy: { createdAt: "desc" } });
  const loans = records.map(toLoan).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return [...loans.filter((l) => l.remaining > 0), ...loans.filter((l) => l.remaining <= 0)];
}

/** `null` si no existe o el id no es un UUID. */
export async function getLoan(id: string): Promise<Loan | null> {
  if (!isUuid(id)) return null;
  const record = await prisma.loan.findUnique({ where: { id }, include: withEntries });
  
  return record && toLoan(record);
}

function itemExpense(borrower: string, item: { id: string; concept: string; amount: Prisma.Decimal; date: Date }) {
  return {
    type:       "expense",
    amount:     item.amount,
    categoryId: LOAN_CATEGORY_ID,
    concept:    `${item.concept} (${borrower})`,
    date:       item.date,
    loanItemId: item.id,
  } satisfies Prisma.TransactionCreateManyInput;
}

function repaymentIncome(borrower: string, payment: { id: string; amount: Prisma.Decimal; date: Date }) {
  return {
    type:          "income",
    amount:        payment.amount,
    categoryId:    LOAN_REPAYMENT_CATEGORY_ID,
    concept:       `Abono de ${borrower}`,
    date:          payment.date,
    loanPaymentId: payment.id,
  } satisfies Prisma.TransactionCreateManyInput;
}

/** Rehace los movimientos de los montos y abonos según `countInTotals` (son pocos: se borran y se crean). */
async function syncTransactions(tx: Tx, loanId: string): Promise<void> {
  const loan = await tx.loan.findUniqueOrThrow({ where: { id: loanId }, include: { items: true, payments: true } });
  await tx.transaction.deleteMany({
    where: { OR: [{ loanItem: { loanId } }, { loanPayment: { loanId } }] },
  });
  if (!loan.countInTotals) return;
  await tx.transaction.createMany({
    data: [
      ...loan.items.map((i) => itemExpense(loan.borrower, i)),
      ...loan.payments.map((p) => repaymentIncome(loan.borrower, p)),
    ],
  });
}

async function createItem(tx: Tx, loan: { id: string; borrower: string; countInTotals: boolean }, input: LoanItemInput) {
  const item = await tx.loanItem.create({
    data: { loanId: loan.id, concept: input.concept, amount: input.amount.toFixed(2), date: input.date },
  });
  if (loan.countInTotals) await tx.transaction.create({ data: itemExpense(loan.borrower, item) });
}

export async function createLoan(input: {
  borrower: string;
  countInTotals: boolean;
  items: LoanItemInput[];
}): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.create({ data: { borrower: input.borrower, countInTotals: input.countInTotals } });
    for (const item of input.items) await createItem(tx, loan, item);
    return loan.id;
  });
}

export async function updateLoan(id: string, input: { borrower: string; countInTotals: boolean }): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.loan.update({ where: { id }, data: input });
    await syncTransactions(tx, id);
  });
}

/** Borra también sus montos, abonos y los movimientos generados (`onDelete: Cascade`). */
export async function deleteLoan(id: string): Promise<void> {
  await prisma.loan.deleteMany({ where: { id } });
}

export async function addLoanItem(loan: Loan, input: LoanItemInput): Promise<void> {
  await prisma.$transaction((tx) => createItem(tx, loan, input));
}

/** Borra también su movimiento de gasto (`onDelete: Cascade`). */
export async function deleteLoanItem(loanId: string, itemId: string): Promise<void> {
  if (!isUuid(itemId)) return;
  await prisma.loanItem.deleteMany({ where: { id: itemId, loanId } });
}

export async function addLoanPayment(loan: Loan, input: LoanPaymentInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.loanPayment.create({
      data: { loanId: loan.id, amount: input.amount.toFixed(2), date: input.date },
    });
    if (loan.countInTotals) await tx.transaction.create({ data: repaymentIncome(loan.borrower, payment) });
  });
}

/** Borra también su movimiento de ingreso (`onDelete: Cascade`). */
export async function deleteLoanPayment(loanId: string, paymentId: string): Promise<void> {
  if (!isUuid(paymentId)) return;
  await prisma.loanPayment.deleteMany({ where: { id: paymentId, loanId } });
}
