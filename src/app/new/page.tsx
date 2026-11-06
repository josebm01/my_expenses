import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormPageContainer } from "@/components/layout/FormPageContainer";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { getCategories } from "@/lib/categories";
import { todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Nuevo movimiento · Mis Gastos" };

export default function NewTransactionPage() {
  return (
    <FormPageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <NewTransactionContent />
      </Suspense>
    </FormPageContainer>
  );
}

async function NewTransactionContent() {
  // "Hoy" depende de la fecha de la petición, no del build.
  await connection();
  const categories = await getCategories();
  return <TransactionForm today={todayKey()} categories={categories} />;
}
