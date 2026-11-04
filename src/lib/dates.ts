export const TIME_ZONE = "America/Mexico_City";

/** "YYYY-MM-DD" en la zona de la app. */
export type DayKey = string;
/** "YYYY-MM" en la zona de la app. */
export type MonthKey = string;

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const WEEKDAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDayKey(date: Date): DayKey {
  return dayKeyFormatter.format(date);
}

export function toMonthKey(date: Date): MonthKey {
  return toDayKey(date).slice(0, 7);
}

export function todayKey(): DayKey {
  return toDayKey(new Date());
}

const hourFormatter = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" });

/** Hora actual (0–23) en la zona de la app. */
export function currentHour(): number {
  return Number(hourFormatter.format(new Date()));
}

export function parseMonthKey(value: unknown): MonthKey | null {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : null;
}

export function parseDayKey(value: unknown): DayKey | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? value : null;
}

function splitKey(key: string) {
  const [y, m, d = 1] = key.split("-").map(Number);
  return { y, m, d };
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  const { y, m } = splitKey(month);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

export function shiftDay(day: DayKey, delta: number): DayKey {
  const { y, m, d } = splitKey(day);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

/** Los últimos `count` meses hasta `current` (más reciente primero), incluyendo `selected` si queda fuera. */
export function recentMonths(current: MonthKey, selected: MonthKey, count = 12): MonthKey[] {
  const months = Array.from({ length: count }, (_, i) => shiftMonth(current, -i));
  return months.includes(selected) ? months : [selected, ...months].sort().reverse();
}

export function daysInMonth(month: MonthKey): number {
  const { y, m } = splitKey(month);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Convierte un día local a un instante (mediodía en Ciudad de México, sin horario de verano desde 2022). */
export function dayKeyToDate(day: DayKey): Date {
  return new Date(`${day}T12:00:00-06:00`);
}

/** Instantes [start, end) que abarca el mes en Ciudad de México, para filtrar por `date`. */
export function monthRange(month: MonthKey): { start: Date; end: Date } {
  return {
    start: new Date(`${month}-01T00:00:00-06:00`),
    end: new Date(`${shiftMonth(month, 1)}-01T00:00:00-06:00`),
  };
}

/** "Octubre 2026" */
export function formatMonthTitle(month: MonthKey): string {
  const { y, m } = splitKey(month);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** "Octubre" */
export function formatMonthName(month: MonthKey): string {
  return MONTH_NAMES[splitKey(month).m - 1];
}

/** "Oct" */
export function formatMonthShort(month: MonthKey): string {
  return formatMonthName(month).slice(0, 3);
}

/** "31 oct" */
export function formatShortDate(day: DayKey): string {
  const { m, d } = splitKey(day);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3).toLowerCase()}`;
}

/** "Miércoles 4 de noviembre" */
export function formatLongDate(day: DayKey): string {
  const { y, m, d } = splitKey(day);
  const weekday = WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday} ${d} de ${MONTH_NAMES[m - 1].toLowerCase()}`;
}

/** "Hoy" · "Ayer" · "29 oct" */
export function formatRelativeDay(day: DayKey, today: DayKey): string {
  if (day === today) return "Hoy";
  if (day === shiftDay(today, -1)) return "Ayer";
  return formatShortDate(day);
}

/** "Hoy · vie 31 oct" · "Ayer · jue 30 oct" · "mié 29 oct" */
export function formatDayHeading(day: DayKey, today: DayKey): string {
  const { y, m, d } = splitKey(day);
  const weekday = WEEKDAY_SHORT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const label = `${weekday} ${formatShortDate(day)}`;
  if (day === today) return `Hoy · ${label}`;
  if (day === shiftDay(today, -1)) return `Ayer · ${label}`;
  return label;
}
