import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Category, type Prisma } from "../src/generated/prisma/client";
import { assertSafeDatabaseUrl } from "../src/lib/database-guard";
import type { MonthKey } from "../src/lib/dates";

// Igual que prisma.config.ts: en desarrollo gana .env.development.local (Postgres de Docker).
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info: () => {}, error: console.error });
assertSafeDatabaseUrl(process.env.DATABASE_URL, "DATABASE_URL");

// Datos de ejemplo que replican design/*.dc.html. Usan las categorías por defecto que inserta la migración.

type CategoryId =
  | "home"
  | "groceries"
  | "transport"
  | "utilities"
  | "entertainment"
  | "shopping"
  | "health"
  | "salary"
  | "freelance"
  | "sales"
  | "refund";

type Seed = [datetime: string, categoryId: CategoryId, amount: number, concept: string, note?: string];

const OCTOBER: Seed[] = [
  ["2026-10-31T19:10", "groceries", 842.5, "Superama", "Súper de la semana"],
  ["2026-10-31T08:40", "transport", 126, "Uber", "Oficina → casa"],
  ["2026-10-30T21:00", "freelance", 4000, "Pago freelance", "Landing page cliente"],
  ["2026-10-30T20:15", "entertainment", 310, "Cinépolis", "Boletos + palomitas"],
  ["2026-10-29T18:30", "health", 385, "Farmacia San Pablo", "Medicamentos"],
  ["2026-10-29T12:00", "utilities", 540, "CFE", "Luz bimestral"],
  ["2026-10-29T10:20", "shopping", 699, "Amazon", "Audífonos"],
  ["2026-10-24T11:00", "groceries", 1200, "Mercado", "Fruta y verdura"],
  ["2026-10-22T09:00", "transport", 900, "Gasolina"],
  ["2026-10-20T10:00", "utilities", 350, "Agua"],
  ["2026-10-18T22:00", "entertainment", 1181, "Concierto"],
  ["2026-10-17T13:00", "groceries", 1850, "Walmart"],
  ["2026-10-15T09:00", "salary", 14000, "Sueldo", "Segunda quincena"],
  ["2026-10-15T08:00", "transport", 304, "Uber"],
  ["2026-10-14T17:00", "shopping", 911, "Liverpool", "Ropa"],
  ["2026-10-12T10:00", "utilities", 450, "Telcel"],
  ["2026-10-10T12:00", "groceries", 2347.5, "Costco"],
  ["2026-10-09T16:00", "health", 800, "Consulta médica"],
  ["2026-10-08T09:00", "transport", 850, "Gasolina"],
  ["2026-10-05T10:00", "utilities", 610, "Internet"],
  ["2026-10-03T10:00", "entertainment", 129, "Spotify"],
  ["2026-10-02T07:00", "health", 265, "Gimnasio"],
  ["2026-10-01T10:00", "home", 8500, "Renta"],
  ["2026-10-01T09:00", "salary", 14000, "Sueldo", "Primera quincena"],
];

type ExpenseSplit = Partial<Record<CategoryId, number>>;

const PREVIOUS_MONTHS: { month: MonthKey; income: [CategoryId, number][]; expenses: ExpenseSplit }[] = [
  { month: "2026-05", income: [["salary", 28000], ["freelance", 4000]], expenses: { home: 8500, groceries: 5400, transport: 2050, utilities: 1820, entertainment: 1230, shopping: 1300, health: 1000 } },
  { month: "2026-06", income: [["salary", 28000], ["freelance", 4000]], expenses: { home: 8500, groceries: 6100, transport: 2400, utilities: 1900, entertainment: 2100, shopping: 1900, health: 1200 } },
  { month: "2026-07", income: [["salary", 28000], ["freelance", 4000]], expenses: { home: 8500, groceries: 5900, transport: 2200, utilities: 1850, entertainment: 1700, shopping: 1500, health: 1100 } },
  { month: "2026-08", income: [["salary", 28000], ["refund", 2000]], expenses: { home: 8500, groceries: 6300, transport: 2600, utilities: 1950, entertainment: 2350, shopping: 3200, health: 1500 } },
  { month: "2026-09", income: [["salary", 28000], ["sales", 5500]], expenses: { home: 8500, groceries: 5778, transport: 2295, utilities: 1893, entertainment: 1328, shopping: 2333, health: 1295 } },
];

function seedToRecord(
  categories: Map<string, Category>,
  [datetime, categoryId, amount, concept, note]: Seed,
): Prisma.TransactionCreateManyInput {
  const category = categories.get(categoryId);
  if (!category) throw new Error(`Falta la categoría por defecto "${categoryId}"; corre las migraciones.`);
  return {
    type: category.type,
    amount: amount.toFixed(2),
    categoryId,
    concept,
    note: note ?? null,
    date: new Date(`${datetime}:00-06:00`),
  };
}

function previousMonthSeeds(categories: Map<string, Category>): Seed[] {
  const nameOf = (categoryId: CategoryId) => categories.get(categoryId)?.name ?? categoryId;
  return PREVIOUS_MONTHS.flatMap(({ month, income, expenses }) => [
    ...income.map(([categoryId, amount], i): Seed => [`${month}-${i === 0 ? "01" : "20"}T09:00`, categoryId, amount, nameOf(categoryId)]),
    ...Object.entries(expenses).map(([categoryId, amount], i): Seed => [
      `${month}-${String(2 + i * 3).padStart(2, "0")}T12:00`,
      categoryId as CategoryId,
      amount,
      nameOf(categoryId as CategoryId),
    ]),
  ]);
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const existing = await prisma.transaction.count();
    if (existing > 0) {
      console.log(`La tabla ya tiene ${existing} movimientos; no se cargan datos de ejemplo.`);
      return;
    }
    const categories = new Map((await prisma.category.findMany()).map((c) => [c.id, c]));
    const { count } = await prisma.transaction.createMany({
      data: [...OCTOBER, ...previousMonthSeeds(categories)].map((seed) => seedToRecord(categories, seed)),
    });
    console.log(`Se cargaron ${count} movimientos de ejemplo.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
