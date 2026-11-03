import { CategoryIcon } from "@/components/CategoryIcon";
import { formatSignedCurrency } from "@/lib/format";
import { signedAmount, transactionTitle, type Transaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  transaction: Transaction;
  meta: string;
  className?: string;
}

export function TransactionRow({ transaction, meta, className }: TransactionRowProps) {
  return (
    <li className={cn("flex items-center gap-3", className)}>
      <CategoryIcon category={transaction.category} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold">{transactionTitle(transaction)}</span>
        <span className="truncate text-xs text-ink-soft">{meta}</span>
      </div>
      <span className={cn("text-sm font-bold whitespace-nowrap", transaction.type === "income" ? "text-income" : "text-ink")}>
        {formatSignedCurrency(signedAmount(transaction))}
      </span>
    </li>
  );
}
