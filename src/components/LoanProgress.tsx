import type { Loan } from "@/lib/loans";
import { cn } from "@/lib/utils";

interface LoanProgressProps {
  loan: Pick<Loan, "amount" | "paid">;
  /** Sobre el panel oscuro del detalle. */
  onDark?: boolean;
  className?: string;
}

/** Barra de lo cobrado respecto al monto prestado. */
export function LoanProgress({ loan, onDark = false, className }: LoanProgressProps) {
  const percent = loan.amount > 0 ? Math.min(100, (loan.paid / loan.amount) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label="Cobrado"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={cn("h-2 overflow-hidden rounded-full", onDark ? "bg-night" : "bg-track", className)}
    >
      <div
        className={cn("h-full rounded-full", onDark ? "bg-income-on-dark" : "bg-income")}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
