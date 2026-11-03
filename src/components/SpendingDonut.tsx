"use client";

import type { ReactNode } from "react";
import { Pie, PieChart } from "recharts";

export interface DonutSlice {
  name: string;
  amount: number;
  fill: string;
}

interface SpendingDonutProps {
  slices: DonutSlice[];
  ariaLabel: string;
  /** Texto centrado dentro de la dona. */
  children: ReactNode;
}

export function SpendingDonut({ slices, ariaLabel, children }: SpendingDonutProps) {
  const data = slices.length > 0 ? slices : [{ name: "Sin gastos", amount: 1, fill: "#EEF0EC" }];

  return (
    <div className="relative size-[200px]">
      <PieChart width={200} height={200} role="img" aria-label={ariaLabel}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={59}
          outerRadius={81}
          startAngle={90}
          endAngle={-270}
          paddingAngle={slices.length > 1 ? 1.5 : 0}
          stroke="none"
          isAnimationActive={false}
        />
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">{children}</div>
    </div>
  );
}
