import Link from "next/link";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { formatSignedCurrency } from "@/lib/format";
import { signedAmount, transactionTitle, type Transaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  meta: string;
  /** Abre el formulario de edición. */
  href: string;
  className?: string;
}

export function TransactionRow({ transaction, meta, href, className }: TransactionRowProps) {
  return (
    <li>
      <Link href={href} className={cn("-mx-2 flex items-center gap-3 rounded-control px-2 hover:bg-canvas", className)}>
        <CategoryIcon category={transaction.category} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{transactionTitle(transaction)}</span>
          <span className="truncate text-xs text-ink-soft">{meta}</span>
        </div>
        <span className={cn("text-sm font-bold whitespace-nowrap", transaction.type === "income" ? "text-income" : "text-expense")}>
          {formatSignedCurrency(signedAmount(transaction))}
        </span>
      </Link>
    </li>
  );
}
