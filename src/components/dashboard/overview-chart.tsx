"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Ene", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 5000, expense: 9800 },
  { name: "Abr", income: 2780, expense: 3908 },
  { name: "May", income: 1890, expense: 4800 },
  { name: "Jun", income: 2390, expense: 3800 },
  { name: "Jul", income: 3490, expense: 4300 },
  { name: "Ago", income: 3650, expense: 4100 },
  { name: "Sep", income: 3120, expense: 3900 },
  { name: "Oct", income: 4500, expense: 5200 },
  { name: "Nov", income: 3800, expense: 4100 },
  { name: "Dic", income: 4200, expense: 4300 },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Legend 
            wrapperStyle={{ color: 'hsl(var(--foreground))' }} 
            formatter={(value, entry) => {
                const name = value === 'income' ? 'Ingresos' : 'Gastos';
                return <span style={{ color: entry.color }}>{name}</span>
            }}
        />
        <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Ingresos" />
        <Bar dataKey="expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Gastos" />
      </BarChart>
    </ResponsiveContainer>
  );
}
