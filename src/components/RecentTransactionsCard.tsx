import Link from "next/link";
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

const editHref = (t: Transaction) => `/transactions/${t.id}?desde=inicio`;

/** Esquinas solo en la fila resaltada; si fueran fijas, los divisores se curvarían en las orillas. */
const roundedWhenActive = (side: "l" | "r") =>
  side === "l"
    ? "group-hover:rounded-l-control group-has-[:focus-visible]:rounded-l-control"
    : "group-hover:rounded-r-control group-has-[:focus-visible]:rounded-r-control";

/** Móvil: lista de 3. Escritorio: tabla con todos los recibidos. Cada fila abre la edición. */
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
                href={editHref(t)}
                className="py-1.5"
              />
            ))}
          </ul>

          {/* `-mx-3` + `px-3` en las orillas: el texto queda alineado con el título y el resaltado de la fila
              tiene aire a los lados. */}
          <div className="-mx-3 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft">
                  <th className="py-2 pr-2 pl-3 font-bold">Fecha</th>
                  <th className="p-2 font-bold">Concepto</th>
                  <th className="p-2 font-bold">Categoría</th>
                  <th className="py-2 pr-3 pl-2 text-right font-bold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const { category } = t;
                  const href = editHref(t);
                  // Cada celda enlaza a la edición para que toda la fila sea clicable (Safari ignora
                  // `position: relative` en <tr>, así que no sirve estirar un solo enlace). Solo el del
                  // concepto es enfocable y se anuncia; los demás son duplicados.
                  const cellLink = "flex min-h-[50px] items-center outline-none";
                  const duplicate = { tabIndex: -1, "aria-hidden": true } as const;
                  // El resaltado va en las celdas (un <tr> no admite esquinas redondeadas). Los divisores de la
                  // fila resaltada y de la siguiente se ocultan para que no corten el fondo.
                  const cell = cn(
                    "border-t border-track",
                    "group-hover:border-transparent group-hover:bg-canvas",
                    "group-has-[:focus-visible]:border-transparent group-has-[:focus-visible]:bg-canvas",
                    "[tr:hover+tr>&]:border-transparent [tr:has(:focus-visible)+tr>&]:border-transparent",
                  );
                  return (
                    <tr key={t.id} className="group">
                      <td className={cn(cell, roundedWhenActive("l"), "pr-2 pl-3 whitespace-nowrap text-ink-soft")}>
                        <Link href={href} className={cellLink} {...duplicate}>
                          {formatShortDate(toDayKey(t.date))}
                        </Link>
                      </td>
                      <td className={cn(cell, "px-2 font-semibold")}>
                        <Link href={href} className={cn(cellLink, "underline-offset-4 focus-visible:underline")}>
                          {transactionTitle(t)}
                        </Link>
                      </td>
                      <td className={cn(cell, "px-2")}>
                        <Link href={href} className={cellLink} {...duplicate}>
                          <span
                            className="inline-flex h-[26px] items-center rounded-full px-2.5 text-xs font-bold"
                            style={{ backgroundColor: category.tint, color: category.color }}
                          >
                            {category.name}
                          </span>
                        </Link>
                      </td>
                      <td
                        className={cn(
                          cell,
                          roundedWhenActive("r"),
                          "pr-3 pl-2 font-bold",
                          t.type === "income" ? "text-income" : "text-expense",
                        )}
                      >
                        <Link href={href} className={cn(cellLink, "justify-end")} {...duplicate}>
                          {formatSignedCurrency(signedAmount(t))}
                        </Link>
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
