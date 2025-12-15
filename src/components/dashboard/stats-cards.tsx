'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Invoice, Income } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Users, FileText, Banknote, Loader2 } from 'lucide-react';
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

  const { totalPagado, totalPendiente, totalFacturado } = useMemo(() => {
    const totalPagado = (incomeData || []).reduce((sum, p) => sum + p.amount, 0);

    const totalPendiente = (invoicesData || [])
      .filter((c) => c.status === 'pendiente' || c.status === 'vencida')
      .reduce((sum, c) => sum + c.amountDue, 0);

    const totalFacturado = (invoicesData || []).reduce(
      (sum, c) => sum + c.amountDue,
      0
    );

    return { totalPagado, totalPendiente, totalFacturado };
  }, [incomeData, invoicesData]);

  const isLoading = incomeLoading || invoicesLoading;

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
            Pendiente de Cobro
          </CardTitle>
          <FileText className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(totalPendiente)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Total en cuentas por pagar
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
