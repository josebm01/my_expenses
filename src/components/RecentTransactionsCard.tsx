import { Card } from "@/components/Card";
import { TransactionRow } from "@/components/TransactionRow";
import { formatRelativeDay, formatShortDate, toDayKey, type DayKey } from "@/lib/dates";
import { formatSignedCurrency } from "@/lib/format";
import { signedAmount, transactionTitle, type Transaction } from "@/lib/transactions";
import { cn } from "@/lib/utils";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  today: DayKey;
  transactionsHref: string;
  title?: string;
  emptyMessage?: string;
}

/** Móvil: lista de 3. Escritorio: tabla con todos los recibidos. */
export function RecentTransactionsCard({
  transactions,
  today,
  transactionsHref,
  title = "Últimos movimientos",
  emptyMessage = "Sin movimientos este mes.",
}: RecentTransactionsCardProps) {
  return (
    <Card title={title} link={{ href: transactionsHref, label: "Ver todos" }} className="gap-2 lg:gap-3">
      {transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">{emptyMessage}</p>
      ) : (
        <>
          <ul className="flex flex-col lg:hidden">
            {transactions.slice(0, 3).map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                meta={`${t.category.name} · ${formatRelativeDay(toDayKey(t.date), today)}`}
                className="py-1.5"
              />
            ))}
          </ul>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft">
                  <th className="py-2 pr-2 font-bold">Fecha</th>
                  <th className="p-2 font-bold">Concepto</th>
                  <th className="p-2 font-bold">Categoría</th>
                  <th className="py-2 pl-2 text-right font-bold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const { category } = t;
                  return (
                    <tr key={t.id} className="border-t border-track">
                      <td className="py-3 pr-2 whitespace-nowrap text-ink-soft">{formatShortDate(toDayKey(t.date))}</td>
                      <td className="p-2 py-3 font-semibold">{transactionTitle(t)}</td>
                      <td className="p-2 py-3">
                        <span
                          className="inline-flex h-[26px] items-center rounded-full px-2.5 text-xs font-bold"
                          style={{ backgroundColor: category.tint, color: category.color }}
                        >
                          {category.name}
                        </span>
                      </td>
                      <td className={cn("py-3 pl-2 text-right font-bold", t.type === "income" ? "text-income" : "text-ink")}>
                        {formatSignedCurrency(signedAmount(t))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
