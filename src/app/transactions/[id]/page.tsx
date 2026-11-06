import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormPageContainer } from "@/components/layout/FormPageContainer";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { getCategories } from "@/lib/categories";
import { toDayKey, todayKey } from "@/lib/dates";
import { transactionOriginHref } from "@/lib/navigation";
import { getTransaction } from "@/lib/transactions";
import { firstParam } from "@/lib/url";

export const metadata: Metadata = { title: "Editar movimiento · Mis Gastos" };

export default function EditTransactionPage({ params, searchParams }: PageProps<"/transactions/[id]">) {
  return (
    <FormPageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <EditTransactionContent params={params} searchParams={searchParams} />
      </Suspense>
    </FormPageContainer>
  );
}

async function EditTransactionContent({
  params,
  searchParams,
}: Pick<PageProps<"/transactions/[id]">, "params" | "searchParams">) {
  const [{ id }, { desde }] = await Promise.all([params, searchParams]);
  // Siempre leer la versión actual de la base de datos.
  await connection();
  const [transaction, categories] = await Promise.all([getTransaction(id), getCategories()]);
  if (!transaction) notFound();
  // El préstamo mantiene sus movimientos: se editan desde ahí.
  if (transaction.loanId) redirect(`/loans/${transaction.loanId}`);

  const origin = firstParam(desde) === "inicio" ? "home" : "transactions";
  // Una categoría archivada no se ofrece en altas, pero el movimiento puede conservarla.
  const options = categories.some((c) => c.id === transaction.category.id)
    ? categories
    : [...categories, transaction.category];

  return (
    <TransactionForm
      today={todayKey()}
      categories={options}
      transaction={transaction}
      origin={origin}
      closeHref={transactionOriginHref(origin, toDayKey(transaction.date))}
    />
  );
}
