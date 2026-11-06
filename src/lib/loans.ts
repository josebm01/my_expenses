import type { Prisma } from "@/generated/prisma/client";
import { LOAN_CATEGORY_ID, LOAN_REPAYMENT_CATEGORY_ID } from "./categories";
import { prisma } from "./prisma";
import { isUuid } from "./transactions";

// Préstamos que hice yo: el préstamo es dinero que sale y cada abono es dinero que regresa.
// Si `countInTotals` está activo, se reflejan como movimientos (gasto e ingresos "Préstamos")
// para que Inicio, Movimientos y Resumen los cuenten; si no, solo viven aquí.

export interface LoanPayment {
  id: string;
  amount: number;
  date: Date;
  /** Lo que quedaba por cobrar después de este abono. */
  balance: number;
}

export interface Loan {
  id: string;
  borrower: string;
  amount: number;
  date: Date;
  countInTotals: boolean;
  /** Suma de los abonos. */
  paid: number;
  /** Lo que falta por cobrar. */
  remaining: number;
  /** Del más reciente al más antiguo. */
  payments: LoanPayment[];
}

export interface LoanInput {
  borrower: string;
  amount: number;
  date: Date;
  countInTotals: boolean;
}

export interface LoanPaymentInput {
  amount: number;
  date: Date;
}

const oldestFirst: Prisma.LoanPaymentOrderByWithRelationInput[] = [{ date: "asc" }, { createdAt: "asc" }];
const withPayments = { payments: { orderBy: oldestFirst } } satisfies Prisma.LoanInclude;

type LoanRecord = Prisma.LoanGetPayload<{ include: typeof withPayments }>;
type Tx = Prisma.TransactionClient;

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Los abonos se recorren en orden para ir restando el saldo. */
function toLoan(record: LoanRecord): Loan {
  const amount = record.amount.toNumber();
  let balance = amount;
  const payments = record.payments.map((p) => {
    const value = p.amount.toNumber();
    balance = roundCents(balance - value);
    return { id: p.id, amount: value, date: p.date, balance };
  });
  return {
    id: record.id,
    borrower: record.borrower,
    amount,
    date: record.date,
    countInTotals: record.countInTotals,
    paid: roundCents(amount - balance),
    remaining: balance,
    payments: payments.reverse(),
  };
}

/** Pendientes primero; dentro de cada grupo, el más reciente arriba. */
export async function getLoans(): Promise<Loan[]> {
  const records = await prisma.loan.findMany({
    include: withPayments,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  const loans = records.map(toLoan);
  return [...loans.filter((l) => l.remaining > 0), ...loans.filter((l) => l.remaining <= 0)];
}

/** `null` si no existe o el id no es un UUID. */
export async function getLoan(id: string): Promise<Loan | null> {
  if (!isUuid(id)) return null;
  const record = await prisma.loan.findUnique({ where: { id }, include: withPayments });
  return record && toLoan(record);
}

function loanExpense(loan: { id: string; borrower: string; amount: Prisma.Decimal; date: Date }) {
  return {
    type: "expense",
    amount: loan.amount,
    categoryId: LOAN_CATEGORY_ID,
    concept: `Préstamo a ${loan.borrower}`,
    date: loan.date,
    loanId: loan.id,
  } satisfies Prisma.TransactionCreateManyInput;
}

function repaymentIncome(borrower: string, payment: { id: string; amount: Prisma.Decimal; date: Date }) {
  return {
    type: "income",
    amount: payment.amount,
    categoryId: LOAN_REPAYMENT_CATEGORY_ID,
    concept: `Abono de ${borrower}`,
    date: payment.date,
    loanPaymentId: payment.id,
  } satisfies Prisma.TransactionCreateManyInput;
}

/** Rehace los movimientos del préstamo y sus abonos según `countInTotals` (son pocos: se borran y se crean). */
async function syncTransactions(tx: Tx, loanId: string): Promise<void> {
  const loan = await tx.loan.findUniqueOrThrow({ where: { id: loanId }, include: { payments: true } });
  await tx.transaction.deleteMany({ where: { OR: [{ loanId }, { loanPayment: { loanId } }] } });
  if (!loan.countInTotals) return;
  await tx.transaction.createMany({
    data: [loanExpense(loan), ...loan.payments.map((p) => repaymentIncome(loan.borrower, p))],
  });
}

export async function createLoan(input: LoanInput): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loan.create({ data: { ...input, amount: input.amount.toFixed(2) } });
    if (loan.countInTotals) await tx.transaction.create({ data: loanExpense(loan) });
    return loan.id;
  });
}

export async function updateLoan(id: string, input: LoanInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.loan.update({ where: { id }, data: { ...input, amount: input.amount.toFixed(2) } });
    await syncTransactions(tx, id);
  });
}

/** Borra también sus abonos y los movimientos generados (`onDelete: Cascade`). */
export async function deleteLoan(id: string): Promise<void> {
  await prisma.loan.deleteMany({ where: { id } });
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
