import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormPageContainer } from "@/components/layout/FormPageContainer";
import { LoanForm } from "@/components/loans/LoanForm";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { todayKey } from "@/lib/dates";
import { getLoan } from "@/lib/loans";

export const metadata: Metadata = { title: "Editar préstamo · Mis Gastos" };

export default function EditLoanPage({ params }: PageProps<"/loans/[id]/edit">) {
  return (
    <FormPageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <EditLoanContent params={params} />
      </Suspense>
    </FormPageContainer>
  );
}

async function EditLoanContent({ params }: Pick<PageProps<"/loans/[id]/edit">, "params">) {
  const { id } = await params;
  // Siempre leer la versión actual de la base de datos.
  await connection();
  const loan = await getLoan(id);
  if (!loan) notFound();
  return <LoanForm today={todayKey()} loan={loan} />;
}
