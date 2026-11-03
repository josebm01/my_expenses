import type { Prisma, Category as CategoryRecord } from "@/generated/prisma/client";
import {
  CATEGORY_PALETTES,
  isCategoryIconKey,
  isCategoryPaletteKey,
  type CategoryIconKey,
  type CategoryPaletteKey,
} from "./category-styles";
import { prisma } from "./prisma";

export type TransactionType = "expense" | "income";

export interface Category {
  id: string;
  type: TransactionType;
  name: string;
  icon: CategoryIconKey;
  palette: CategoryPaletteKey;
  /** Color del ícono y del texto sobre `tint`. */
  color: string;
  /** Fondo suave del ícono / chip. */
  tint: string;
  /** Color más brillante para gráficas de dona y barras. */
  chartColor: string;
}

export interface CategoryInput {
  name: string;
  icon: CategoryIconKey;
  palette: CategoryPaletteKey;
}

const byPosition: Prisma.CategoryOrderByWithRelationInput[] = [{ position: "asc" }, { createdAt: "asc" }];

/** Claves desconocidas (p. ej. editadas a mano en Prisma Studio) caen en el ícono y color de "Otro". */
export function toCategory(record: CategoryRecord): Category {
  const palette = isCategoryPaletteKey(record.palette) ? record.palette : "gray";
  const { color, tint, chartColor } = CATEGORY_PALETTES[palette];
  return {
    id: record.id,
    type: record.type,
    name: record.name,
    icon: isCategoryIconKey(record.icon) ? record.icon : "ellipsis",
    palette,
    color,
    tint,
    chartColor,
  };
}

/** Categorías activas (no archivadas), en el orden de la cuadrícula de "Nuevo movimiento". */
export async function getCategories(type?: TransactionType): Promise<Category[]> {
  const records = await prisma.category.findMany({ where: { type, archivedAt: null }, orderBy: byPosition });
  return records.map(toCategory);
}

/** Solo categorías activas: las archivadas no se pueden editar ni elegir. */
export async function getActiveCategory(id: string): Promise<Category | null> {
  const record = await prisma.category.findFirst({ where: { id, archivedAt: null } });
  return record && toCategory(record);
}

/** Si ya hay otra categoría activa del mismo tipo con ese nombre (sin distinguir mayúsculas). */
export async function isCategoryNameTaken(type: TransactionType, name: string, exceptId?: string): Promise<boolean> {
  const count = await prisma.category.count({
    where: { type, archivedAt: null, name: { equals: name, mode: "insensitive" }, id: { not: exceptId } },
  });
  return count > 0;
}

export async function countActiveCategories(type: TransactionType): Promise<number> {
  return prisma.category.count({ where: { type, archivedAt: null } });
}

/** Las nuevas van al final de la cuadrícula. */
export async function createCategory(type: TransactionType, input: CategoryInput): Promise<Category> {
  const { _max } = await prisma.category.aggregate({ where: { type }, _max: { position: true } });
  const record = await prisma.category.create({
    data: { type, ...input, position: (_max.position ?? -1) + 1 },
  });
  return toCategory(record);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const record = await prisma.category.update({ where: { id }, data: input });
  return toCategory(record);
}

/** Sin movimientos se borra; con movimientos se archiva para que el historial la siga mostrando. */
export async function deleteCategory(id: string): Promise<void> {
  const used = await prisma.transaction.count({ where: { categoryId: id } });
  if (used > 0) {
    await prisma.category.update({ where: { id }, data: { archivedAt: new Date() } });
  } else {
    await prisma.category.delete({ where: { id } });
  }
}
