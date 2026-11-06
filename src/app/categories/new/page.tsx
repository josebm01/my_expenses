import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { FormPageContainer } from "@/components/layout/FormPageContainer";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Nueva categoría · Mis Gastos" };

export default function NewCategoryPage({ searchParams }: PageProps<"/categories/new">) {
  return (
    <FormPageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <NewCategoryContent searchParams={searchParams} />
      </Suspense>
    </FormPageContainer>
  );
}

async function NewCategoryContent({ searchParams }: Pick<PageProps<"/categories/new">, "searchParams">) {
  const { tipo, desde } = await searchParams;
  return (
    <CategoryForm
      initialType={firstParam(tipo) === "ingresos" ? "income" : "expense"}
      fromNew={firstParam(desde) === "nuevo"}
    />
  );
}
