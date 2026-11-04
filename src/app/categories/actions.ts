"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  countActiveCategories,
  createCategory,
  deleteCategory,
  getActiveCategory,
  isCategoryNameTaken,
  updateCategory,
  type TransactionType,
} from "@/lib/categories";
import { CATEGORY_NAME_MAX_LENGTH, isCategoryIconKey, isCategoryPaletteKey } from "@/lib/category-styles";

export interface CategoryFormState {
  error: string | null;
}

/** Vuelve a "Nuevo movimiento" si el editor se abrió desde ahí; si no, a la lista del tipo. */
function returnHref(formData: FormData, type: TransactionType): string {
  if (formData.get("from") === "new") return "/new";
  return type === "income" ? "/categories?tipo=ingresos" : "/categories";
}

async function findCategory(formData: FormData) {
  const id = formData.get("id");
  return typeof id === "string" && id ? getActiveCategory(id) : null;
}

export async function saveCategoryAction(_previous: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireUser();
  const existing = await findCategory(formData);
  if (formData.get("id") && !existing) return { error: "Esta categoría ya no existe." };

  const type = existing?.type ?? formData.get("type");
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const icon = formData.get("icon");
  const palette = formData.get("palette");

  if (type !== "expense" && type !== "income") return { error: "Elige si es de gasto o de ingreso." };
  if (!name) return { error: "Escribe un nombre." };
  if (name.length > CATEGORY_NAME_MAX_LENGTH) return { error: "El nombre es demasiado largo." };
  if (!isCategoryPaletteKey(palette)) return { error: "Elige un color." };
  if (!isCategoryIconKey(icon)) return { error: "Elige un ícono." };
  if (await isCategoryNameTaken(type, name, existing?.id)) return { error: `Ya tienes una categoría “${name}”.` };

  const input = { name, icon, palette };
  if (existing) {
    await updateCategory(existing.id, input);
  } else {
    await createCategory(type, input);
  }
  redirect(returnHref(formData, type));
}

export async function deleteCategoryAction(_previous: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireUser();
  const category = await findCategory(formData);
  if (!category) return { error: "Esta categoría ya no existe." };
  if ((await countActiveCategories(category.type)) <= 1) {
    return { error: `Necesitas al menos una categoría de ${category.type === "expense" ? "gasto" : "ingreso"}.` };
  }

  await deleteCategory(category.id);
  redirect(returnHref(formData, category.type));
}
