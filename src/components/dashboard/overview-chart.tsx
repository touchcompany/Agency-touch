'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Income, Expense } from '@/lib/types';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export function OverviewChart() {
  const { firestore, user } = useFirebase();

  const incomeQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'income') : null
  , [firestore, user]);
  const { data: incomeData, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const expensesQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'expenses') : null
  , [firestore, user]);
  const { data: expenseData, isLoading: expenseLoading } = useCollection<Expense>(expensesQuery);
  
  const chartData = useMemo(() => {
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    
    const aggregatedData = months.map(monthName => ({
      name: monthName,
      income: 0,
      expense: 0,
    }));

    (incomeData || []).forEach(item => {
      const monthIndex = new Date(item.date).getMonth();
      aggregatedData[monthIndex].income += item.amount;
    });

    (expenseData || []).forEach(item => {
      const monthIndex = new Date(item.date).getMonth();
      aggregatedData[monthIndex].expense += item.amount;
    });

    return aggregatedData;
  }, [incomeData, expenseData]);


  if (incomeLoading || expenseLoading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Legend
          wrapperStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value, entry) => {
            const name = value === 'income' ? 'Ingresos' : 'Gastos';
            return <span style={{ color: entry.color }}>{name}</span>;
          }}
        />
        <Bar
          dataKey="income"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
          name="Ingresos"
        />
        <Bar
          dataKey="expense"
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
          name="Gastos"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
