"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction, type CategoryFormState } from "@/app/categories/actions";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import type { Category, TransactionType } from "@/lib/categories";
import {
  CATEGORY_ICONS,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_PALETTES,
  type CategoryIconKey,
  type CategoryPaletteKey,
} from "@/lib/category-styles";
import { cn } from "@/lib/utils";

const DEFAULT_PALETTE: Record<TransactionType, CategoryPaletteKey> = { expense: "orange", income: "cyan" };

interface CategoryFormProps {
  /** Sin `category` se crea una nueva. */
  category?: Category;
  initialType: TransactionType;
  /** Se abrió desde "Nuevo movimiento": cerrar y guardar regresan ahí. */
  fromNew?: boolean;
}

export function CategoryForm({ category, initialType, fromNew = false }: CategoryFormProps) {
  const [saveState, saveAction, isSaving] = useActionState<CategoryFormState, FormData>(saveCategoryAction, {
    error: null,
  });
  const [deleteState, deleteAction, isDeleting] = useActionState<CategoryFormState, FormData>(deleteCategoryAction, {
    error: null,
  });
  const [type, setType] = useState<TransactionType>(category?.type ?? initialType);
  const [name, setName] = useState(category?.name ?? "");
  const [palette, setPalette] = useState<CategoryPaletteKey>(category?.palette ?? DEFAULT_PALETTE[initialType]);
  const [icon, setIcon] = useState<CategoryIconKey>(category?.icon ?? "tag");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { color, tint } = CATEGORY_PALETTES[palette];
  const closeHref = fromNew ? "/new" : type === "income" ? "/categories?tipo=ingresos" : "/categories";

  return (
    <form action={saveAction} className="flex min-h-full flex-1 flex-col gap-[18px]">
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="palette" value={palette} />
      <input type="hidden" name="icon" value={icon} />
      {fromNew && <input type="hidden" name="from" value="new" />}

      <div className="flex items-center justify-between">
        <Link
          href={closeHref}
          aria-label="Cerrar"
          className="flex size-11 items-center justify-center rounded-icon border border-line bg-surface text-ink hover:bg-canvas"
        >
          <X className="size-5" aria-hidden />
        </Link>
        <h1 className="text-[17px] font-bold">{category ? "Editar categoría" : "Nueva categoría"}</h1>
        <div className="size-11" />
      </div>

      <div className="flex flex-col items-center gap-2 pt-2 pb-1" aria-hidden>
        <CategoryIcon category={{ icon, color, tint }} size="lg" />
        <span className={cn("max-w-full truncate text-base font-bold", !name.trim() && "text-ink-soft")}>
          {name.trim() || "Nombre"}
        </span>
        <span className="text-xs text-ink-soft">{type === "expense" ? "Gasto" : "Ingreso"}</span>
      </div>

      {!category && (
        <div role="group" aria-label="Tipo de categoría" className="grid grid-cols-2 gap-1 rounded-control bg-segment p-1">
          {(["expense", "income"] as const).map((option) => {
            const active = type === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setType(option)}
                className={cn(
                  "h-10 rounded-[11px] text-sm font-bold",
                  active ? "bg-segment-active shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-ink-soft",
                  active && (option === "expense" ? "text-expense" : "text-income"),
                )}
              >
                {option === "expense" ? "Gasto" : "Ingreso"}
              </button>
            );
          })}
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-bold">Nombre</span>
        <input
          name="name"
          required
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={type === "expense" ? "Ej. Mascotas" : "Ej. Rentas"}
          aria-invalid={saveState.error ? true : undefined}
          className="h-12 rounded-control border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-placeholder"
        />
      </label>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-bold">Color</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_PALETTES).map(([key, option]) => {
            const active = palette === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                aria-label={option.label}
                title={option.label}
                onClick={() => setPalette(key as CategoryPaletteKey)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-white",
                  active && "ring-2 ring-ink ring-offset-2 ring-offset-canvas",
                )}
                style={{ backgroundColor: option.chartColor }}
              >
                {active && <Check className="size-5" strokeWidth={2.6} aria-hidden />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[13px] font-bold">Ícono</legend>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(CATEGORY_ICONS).map(([key, { icon: Icon, label }]) => {
            const active = icon === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                aria-label={label}
                title={label}
                onClick={() => setIcon(key as CategoryIconKey)}
                className={cn(
                  "flex h-11 items-center justify-center rounded-control border-2",
                  active ? "border-ink" : "border-surface bg-surface",
                )}
                style={active ? { backgroundColor: tint, color } : undefined}
              >
                <Icon className="size-5" aria-hidden />
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex-1" />

      {saveState.error && (
        <p role="alert" className="text-center text-sm font-semibold text-expense">
          {saveState.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving || isDeleting}
        className="h-14 shrink-0 rounded-2xl bg-ink text-base font-bold text-on-ink hover:bg-ink/90 disabled:opacity-60"
      >
        {isSaving ? "Guardando…" : category ? "Guardar cambios" : "Crear categoría"}
      </button>

      {category &&
        (confirmingDelete ? (
          <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
            <p className="text-sm text-ink">
              ¿Eliminar <strong>{category.name}</strong>? Los movimientos que ya registraste con ella la conservan.
            </p>
            {deleteState.error && (
              <p role="alert" className="text-sm font-semibold text-expense">
                {deleteState.error}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="h-11 rounded-control border border-line-strong bg-surface text-sm font-bold text-ink hover:bg-canvas"
              >
                Cancelar
              </button>
              <button
                type="submit"
                formAction={deleteAction}
                formNoValidate
                disabled={isSaving || isDeleting}
                className="h-11 rounded-control bg-expense text-sm font-bold text-on-ink hover:bg-expense/90 disabled:opacity-60"
              >
                {isDeleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="h-11 shrink-0 rounded-control text-sm font-bold text-expense hover:bg-surface"
          >
            Eliminar categoría
          </button>
        ))}
    </form>
  );
}
