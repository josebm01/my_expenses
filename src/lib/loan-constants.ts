import { CATEGORY_PALETTES } from "./category-styles";

// Este módulo no toca Prisma para poder usarse en Client Components.

export const BORROWER_MAX_LENGTH = 40;

/** Ícono de la sección Préstamos; igual al de la categoría de gasto "Préstamos" (migración `loans`). */
export const LOAN_ICON = { icon: "hand-coins", ...CATEGORY_PALETTES.brown } as const;
