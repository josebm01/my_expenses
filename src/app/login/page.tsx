import type { Metadata } from "next";
import { Suspense } from "react";
import { FormPageContainer } from "@/components/layout/FormPageContainer";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = { title: "Iniciar sesión · Mis Gastos" };

export default function LoginPage() {
  return (
    <FormPageContainer>
      <div className="flex flex-1 flex-col justify-center gap-8 lg:min-h-[60dvh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-[18px] bg-ink text-2xl font-extrabold text-on-ink">$</span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">Mis Gastos</h1>
            <p className="text-[15px] text-ink-soft">Inicia sesión para ver tus finanzas.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Suspense>
            <GoogleSignInButton />
          </Suspense>
        </div>
      </div>
    </FormPageContainer>
  );
}
