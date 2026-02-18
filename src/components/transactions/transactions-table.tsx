
'use client';
import type { Income, Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

interface TransactionsTableProps {
  month: string;
  year: string;
  customerId: string;
}

export function TransactionsTable({ month, year, customerId }: TransactionsTableProps) {
  const { firestore, user } = useFirebase();
  const locale = 'es-ES';

  const incomeQuery = useMemoFirebase(() => {
    if (!user) return null;

    let q = query(collection(firestore, 'users', user.uid, 'income'), orderBy('date', 'desc'));
    
    // Date filter
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);
    if (!isNaN(parsedYear) && !isNaN(parsedMonth)) {
        const startDate = new Date(parsedYear, parsedMonth - 1, 1);
        const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59);
        q = query(q, where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
    }
    
    // Customer filter
    if(customerId && customerId !== 'all') {
        q = query(q, where('customerId', '==', customerId));
    }

    return q;
  }, [firestore, user, month, year, customerId]);
  
  const { data: income, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const customersQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const getClientName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    if (!customers) return '...';
    return customers.find((c) => c.id === customerId)?.name || 'N/A';
  };

  const isLoading = incomeLoading || customersLoading;

  const filteredIncome = useMemo(() => {
    return income; // Query is already filtered
  }, [income]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!filteredIncome || filteredIncome.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
            No hay ingresos para los filtros seleccionados.
        </div>
      )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredIncome.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {new Date(item.date).toLocaleDateString(locale)}
              </TableCell>
              <TableCell className="font-medium">
                {getClientName(item.customerId)}
              </TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.category}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-green-500">
                +{formatCurrency(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
