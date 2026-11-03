"use client";

import { Bar, BarChart, Tooltip, XAxis, YAxis, type XAxisTickContentProps } from "recharts";
import { formatCurrency } from "@/lib/format";

export interface HistoryBar {
  label: string;
  income: number;
  expenses: number;
  /** Saldo del mes ya formateado ("+$8,450"); solo se muestra en `full`. */
  balanceLabel: string;
  isCurrent: boolean;
}

interface MonthlyHistoryChartProps {
  data: HistoryBar[];
  /** `compact` = Resumen móvil, `full` = dashboard de escritorio (con saldo bajo cada mes). */
  variant: "compact" | "full";
  ariaLabel: string;
}

const SIZES = {
  compact: { plotHeight: 170, axisHeight: 24, barSize: 14, barGap: 3, radius: 4 },
  full: { plotHeight: 240, axisHeight: 44, barSize: 22, barGap: 5, radius: 5 },
} as const;

const INK = "#15171C";
const INK_SOFT = "#5B616E";

export function MonthlyHistoryChart({ data, variant, ariaLabel }: MonthlyHistoryChartProps) {
  const size = SIZES[variant];
  const showBalance = variant === "full";
  const radius: [number, number, number, number] = [size.radius, size.radius, 0, 0];
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.income, d.expenses]));

  function renderTick({ x, y, payload }: XAxisTickContentProps) {
    const point = data[payload.index];
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          textAnchor="middle"
          dy={14}
          fontSize={showBalance ? 13 : 12}
          fontWeight={point.isCurrent ? 800 : 600}
          fill={point.isCurrent ? INK : INK_SOFT}
        >
          {point.label}
        </text>
        {showBalance && (
          <text textAnchor="middle" dy={32} fontSize={12} fill={INK_SOFT}>
            {point.balanceLabel}
          </text>
        )}
      </g>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel}>
      <BarChart
        responsive
        data={data}
        barGap={size.barGap}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        style={{ width: "100%", height: size.plotHeight + size.axisHeight }}
      >
        <XAxis
          dataKey="label"
          interval={0}
          tickLine={false}
          axisLine={{ stroke: "#E4E6E1" }}
          height={size.axisHeight}
          tick={renderTick}
        />
        <YAxis hide domain={[0, maxValue * 1.04]} />
        <Tooltip
          cursor={{ fill: "#EEF0EC" }}
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 12, borderColor: "#E4E6E1", fontSize: 13 }}
          labelStyle={{ fontWeight: 700, color: INK }}
        />
        <Bar dataKey="income" name="Ingresos" fill="#0B6A86" barSize={size.barSize} radius={radius} isAnimationActive={false} />
        <Bar dataKey="expenses" name="Gastos" fill="#E07A2E" barSize={size.barSize} radius={radius} isAnimationActive={false} />
      </BarChart>
    </div>
  );
}
