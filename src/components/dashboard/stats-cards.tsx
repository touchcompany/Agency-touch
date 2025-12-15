'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Invoice, Income, Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Users, Banknote, ArrowDownCircle, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

export function StatsCards() {
  const { firestore, user } = useFirebase();

  const incomeQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'income') : null
  , [firestore, user]);
  const { data: incomeData, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);
  
  const invoicesQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'invoices') : null
  , [firestore, user]);
  const { data: invoicesData, isLoading: invoicesLoading } = useCollection<Invoice>(invoicesQuery);

  const expensesQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'expenses') : null
  , [firestore, user]);
  const { data: expenseData, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const { totalPagado, totalEgresos, totalFacturado } = useMemo(() => {
    const totalPagado = (incomeData || []).reduce((sum, p) => sum + p.amount, 0);

    const totalEgresos = (expenseData || []).reduce((sum, e) => sum + e.amount, 0);

    const totalFacturado = (invoicesData || []).reduce(
      (sum, c) => sum + c.amountDue,
      0
    );

    return { totalPagado, totalEgresos, totalFacturado };
  }, [incomeData, invoicesData, expenseData]);

  const isLoading = incomeLoading || invoicesLoading || expensesLoading;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recibido</CardTitle>
          <Banknote className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(totalPagado)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Suma de todos los pagos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Egresos
          </CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(totalEgresos)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Suma de todos los gastos
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(totalFacturado)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Suma de todas las cuentas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
