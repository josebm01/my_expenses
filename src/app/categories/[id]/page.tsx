import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CategoryForm } from "@/components/CategoryForm";
import { FormPageContainer } from "@/components/FormPageContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { getActiveCategory } from "@/lib/categories";

export const metadata: Metadata = { title: "Editar categoría · Mis Gastos" };

export default function EditCategoryPage({ params }: PageProps<"/categories/[id]">) {
  return (
    <FormPageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <EditCategoryContent params={params} />
      </Suspense>
    </FormPageContainer>
  );
}

async function EditCategoryContent({ params }: Pick<PageProps<"/categories/[id]">, "params">) {
  const { id } = await params;
  // Siempre leer la versión actual de la base de datos.
  await connection();
  const category = await getActiveCategory(id);
  if (!category) notFound();
  return <CategoryForm category={category} initialType={category.type} />;
}
