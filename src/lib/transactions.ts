import type { Prisma } from "@/generated/prisma/client";
import { toCategory, type Category, type TransactionType } from "./categories";
import { daysInMonth, monthRange, shiftMonth, toDayKey, type DayKey, type MonthKey } from "./dates";
import { prisma } from "./prisma";

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Siempre positivo; el signo lo da `type`. */
  amount: number;
  category: Category;
  concept: string | null;
  note: string | null;
  date: Date;
}

const newestFirst: Prisma.TransactionOrderByWithRelationInput[] = [{ date: "desc" }, { createdAt: "desc" }];
const withCategory = { category: true } satisfies Prisma.TransactionInclude;

type TransactionRecord = Prisma.TransactionGetPayload<{ include: typeof withCategory }>;

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function toTransaction(record: TransactionRecord): Transaction {
  return {
    id: record.id,
    type: record.type,
    amount: record.amount.toNumber(),
    category: toCategory(record.category),
    concept: record.concept,
    note: record.note,
    date: record.date,
  };
}

function inMonth(month: MonthKey): Prisma.DateTimeFilter {
  const { start, end } = monthRange(month);
  return { gte: start, lt: end };
}

/** Monto con signo: negativo para gastos. */
export function signedAmount(transaction: Transaction): number {
  return transaction.type === "expense" ? -transaction.amount : transaction.amount;
}

/** Título visible: concepto, si no la nota, si no la categoría. */
export function transactionTitle(transaction: Transaction): string {
  return transaction.concept ?? transaction.note ?? transaction.category.name;
}

export interface MonthTotals {
  income: number;
  expenses: number;
  balance: number;
  /** Porcentaje del ingreso que se ahorra; `null` si no hubo ingresos. */
  savingsRate: number | null;
}

export async function getMonthTotals(month: MonthKey): Promise<MonthTotals> {
  const groups = await prisma.transaction.groupBy({
    by: ["type"],
    where: { date: inMonth(month) },
    _sum: { amount: true },
  });
  const totalFor = (type: TransactionType) => groups.find((g) => g.type === type)?._sum.amount?.toNumber() ?? 0;
  const income = totalFor("income");
  const expenses = totalFor("expense");
  const balance = roundCents(income - expenses);
  return { income, expenses, balance, savingsRate: income > 0 ? (balance / income) * 100 : null };
}

export interface CategorySpend {
  category: Category;
  amount: number;
  /** Porcentaje del gasto total del mes. */
  share: number;
  /** Variación vs el mes anterior en %; `null` si el mes anterior fue 0. */
  change: number | null;
}

export async function getCategoryBreakdown(month: MonthKey): Promise<CategorySpend[]> {
  const totalsFor = async (m: MonthKey) => {
    const groups = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { type: "expense", date: inMonth(m) },
      _sum: { amount: true },
    });
    return new Map(groups.map((g) => [g.categoryId, g._sum.amount?.toNumber() ?? 0]));
  };
  const [current, previous] = await Promise.all([totalsFor(month), totalsFor(shiftMonth(month, -1))]);
  // Incluye archivadas: el historial conserva la categoría con la que se registró el gasto.
  const categories = await prisma.category.findMany({ where: { id: { in: [...current.keys()] } } });
  const total = [...current.values()].reduce((a, b) => a + b, 0);

  return categories
    .map((record) => {
      const amount = current.get(record.id) ?? 0;
      const before = previous.get(record.id) ?? 0;
      return {
        category: toCategory(record),
        amount,
        share: total > 0 ? (amount / total) * 100 : 0,
        change: before > 0 ? ((amount - before) / before) * 100 : null,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthHistoryPoint {
  month: MonthKey;
  income: number;
  expenses: number;
}

/** Ingresos y gastos de los `count` meses que terminan en `month`. */
export async function getMonthlyHistory(month: MonthKey, count = 6): Promise<MonthHistoryPoint[]> {
  return Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const m = shiftMonth(month, i - count + 1);
      const { income, expenses } = await getMonthTotals(m);
      return { month: m, income, expenses };
    }),
  );
}

/** Gasto promedio por día transcurrido del mes (el mes completo si ya terminó). */
export async function getDailyAverage(month: MonthKey, today: DayKey): Promise<number> {
  const { expenses } = await getMonthTotals(month);
  const currentMonth = today.slice(0, 7);
  if (month > currentMonth) return 0;
  const days = month === currentMonth ? Number(today.slice(8, 10)) : daysInMonth(month);
  return roundCents(expenses / days);
}

export async function getRecentTransactions(month: MonthKey, limit: number, type?: TransactionType): Promise<Transaction[]> {
  const records = await prisma.transaction.findMany({
    where: { date: inMonth(month), type },
    include: withCategory,
    orderBy: newestFirst,
    take: limit,
  });
  return records.map(toTransaction);
}

export interface TransactionFilters {
  month: MonthKey;
  type?: TransactionType;
  query?: string;
}

export interface DayGroup {
  day: DayKey;
  /** Suma con signo de los movimientos del día. */
  total: number;
  transactions: Transaction[];
}

export async function getTransactionsByDay({ month, type, query }: TransactionFilters): Promise<DayGroup[]> {
  const records = await prisma.transaction.findMany({
    where: { date: inMonth(month), type },
    include: withCategory,
    orderBy: newestFirst,
  });

  // La búsqueda se filtra aquí y no en SQL: ignora acentos ("cinepolis" → "Cinépolis")
  // e incluye el nombre de la categoría. Un mes son pocas filas.
  const needle = query ? normalize(query.trim()) : "";
  const matches = records.map(toTransaction).filter((t) => {
    if (!needle) return true;
    const haystack = [t.concept, t.note, t.category.name].filter(Boolean).join(" ");
    return normalize(haystack).includes(needle);
  });

  const groups: DayGroup[] = [];
  for (const t of matches) {
    const day = toDayKey(t.date);
    let group = groups.at(-1);
    if (group?.day !== day) {
      group = { day, total: 0, transactions: [] };
      groups.push(group);
    }
    group.transactions.push(t);
    group.total = roundCents(group.total + signedAmount(t));
  }
  return groups;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `null` si no existe o el id no es un UUID (la columna es `@db.Uuid` y Postgres rechazaría la consulta). */
export async function getTransaction(id: string): Promise<Transaction | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const record = await prisma.transaction.findUnique({ where: { id }, include: withCategory });
  return record && toTransaction(record);
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  /** Sin `concept` se deja el que ya tenía (las altas nuevas no lo usan). */
  concept?: string | null;
  note: string | null;
  date: Date;
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const record = await prisma.transaction.create({
    data: { ...input, amount: input.amount.toFixed(2) },
    include: withCategory,
  });
  return toTransaction(record);
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  const record = await prisma.transaction.update({
    where: { id },
    data: { ...input, amount: input.amount.toFixed(2) },
    include: withCategory,
  });
  return toTransaction(record);
}

export async function deleteTransaction(id: string): Promise<void> {
  await prisma.transaction.deleteMany({ where: { id } });
}
