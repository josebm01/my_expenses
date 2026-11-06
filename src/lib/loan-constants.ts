import { CATEGORY_PALETTES } from "./category-styles";

// Este módulo no toca Prisma para poder usarse en Client Components.

export const BORROWER_MAX_LENGTH = 40;
export const LOAN_ITEM_CONCEPT_MAX_LENGTH = 40;
/** Montos que se pueden capturar al crear un préstamo (después se agregan desde el detalle). */
export const MAX_ITEMS_ON_CREATE = 10;

/** Ícono de la sección Préstamos; igual al de la categoría de gasto "Préstamos" (migración `loans`). */
export const LOAN_ICON = { icon: "hand-coins", ...CATEGORY_PALETTES.brown } as const;
