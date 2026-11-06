import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { FilterChips } from "@/components/shared/FilterChips";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { getCategories, type TransactionType } from "@/lib/categories";
import { buildHref, firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Categorías · Mis Gastos" };

const TYPE_TABS: { value?: string; label: string; type: TransactionType }[] = [
  { label: "Gastos", type: "expense" },
  { value: "ingresos", label: "Ingresos", type: "income" },
];

export default function CategoriesPage({ searchParams }: PageProps<"/categories">) {
  return (
    <PageContainer className="gap-3.5 lg:max-w-3xl lg:gap-4">
      <Suspense fallback={<PageSkeleton />}>
        <CategoriesContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}

async function CategoriesContent({ searchParams }: Pick<PageProps<"/categories">, "searchParams">) {
  const { tipo } = await searchParams;
  // Siempre leer la versión actual de la base de datos.
  await connection();
  const tab = TYPE_TABS.find((t) => t.value && t.value === firstParam(tipo)) ?? TYPE_TABS[0];
  const categories = await getCategories(tab.type);

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] lg:text-[30px]">Categorías</h1>
        <Link
          href={buildHref("/categories/new", { tipo: tab.value })}
          className="flex h-11 items-center gap-1.5 rounded-control bg-ink px-4 text-sm font-bold text-on-ink hover:bg-ink/90"
        >
          <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden />
          Nueva
        </Link>
      </header>

      <FilterChips
        label="Tipo de categoría"
        chips={TYPE_TABS.map((t) => ({ label: t.label, href: buildHref("/categories", { tipo: t.value }), active: t === tab }))}
      />

      <ul className="flex flex-col rounded-[18px] bg-surface shadow-card px-3.5 py-1">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/categories/${category.id}`} className="flex items-center gap-3 py-2.5">
              <CategoryIcon category={category} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{category.name}</span>
              <ChevronRight className="size-5 text-ink-soft" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
