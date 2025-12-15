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
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';


export function TransactionsTable() {
  const { firestore, user } = useFirebase();
  const locale = 'es-ES';

  const incomeQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'income'), orderBy('date', 'desc')) : null
  , [firestore, user]);
  const { data: income, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const customersQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'collaborators') : null
  , [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const getClientName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    if (!customers) return '...';
    return customers.find((c) => c.id === customerId)?.name || 'N/A';
  };

  const isLoading = incomeLoading || customersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!income || income.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
            No hay transacciones todavía. ¡Añade una para empezar!
        </div>
      )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {income.map((item) => (
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
