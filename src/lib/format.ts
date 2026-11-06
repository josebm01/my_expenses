const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const currencyWhole = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "$8,450.00" (o "$8,450" con `whole`). */
export function formatCurrency(amount: number, { whole = false } = {}): string {
  return (whole ? currencyWhole : currency).format(amount);
}

/** "+$4,000.00" / "−$842.50" (signo menos tipográfico). */
export function formatSignedCurrency(amount: number, { whole = false } = {}): string {
  return `${amount < 0 ? "−" : "+"}${formatCurrency(Math.abs(amount), { whole })}`;
}

/** Para inputs de monto: deja solo dígitos y un punto, con máximo 10 enteros y 2 decimales (cabe en Decimal(12, 2)). */
export function sanitizeAmount(value: string): string {
  const [rawWhole, ...rest] = value.replace(/[^\d.]/g, "").split(".");
  const whole = rawWhole.slice(0, 10);
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}

/** 26.4 → "26.4%" */
export function formatPercent(value: number): string {
  return `${percent.format(value)}%`;
}

/** 2.5 → "+2.5%" · −3.1 → "−3.1%" */
export function formatSignedPercent(value: number): string {
  return `${value < 0 ? "−" : "+"}${formatPercent(Math.abs(value))}`;
}

/** Variación redondeada para listas: "↑ 8%" · "↓ 5%" · "Igual" · "Nuevo" (sin dato previo). */
export function formatChange(change: number | null): string {
  if (change === null) return "Nuevo";
  const rounded = Math.round(change);
  if (rounded === 0) return "Igual";
  return `${rounded > 0 ? "↑" : "↓"} ${Math.abs(rounded)}%`;
}
