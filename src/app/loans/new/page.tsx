import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormPageContainer } from "@/components/layout/FormPageContainer";
import { LoanForm } from "@/components/loans/LoanForm";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { todayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Nuevo préstamo · Mis Gastos" };

export default function NewLoanPage() {
  return (
    <FormPageContainer>
      <Suspense fallback={<PageSkeleton />}>
        <NewLoanContent />
      </Suspense>
    </FormPageContainer>
  );
}

async function NewLoanContent() {
  // "Hoy" depende de la fecha de la petición, no del prerender.
  await connection();
  return <LoanForm today={todayKey()} />;
}
