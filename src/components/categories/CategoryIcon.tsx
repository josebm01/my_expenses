import type { Category } from "@/lib/categories";
import { CATEGORY_ICONS } from "@/lib/category-styles";
import { cn } from "@/lib/utils";

const SIZES = {
  lg: { box: "size-14 rounded-[16px]", icon: "size-7" },
  md: { box: "size-10 rounded-icon", icon: "size-5" },
  sm: { box: "size-9 rounded-[11px]", icon: "size-[19px]" },
};

interface CategoryIconProps {
  category: Pick<Category, "icon" | "color" | "tint">;
  /** `lg` = 56px (vista previa del editor), `md` = 40px (listas), `sm` = 36px (selector de categoría). */
  size?: keyof typeof SIZES;
}

export function CategoryIcon({ category, size = "md" }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category.icon].icon;

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", SIZES[size].box)}
      style={{ backgroundColor: category.tint, color: category.color }}
    >
      <Icon className={SIZES[size].icon} aria-hidden />
    </span>
  );
}
