
'use client';
import type { Expense, Collaborator } from '@/lib/types';
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
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';


interface ExpensesTableProps {
  month: string;
  year: string;
  collaboratorId: string;
}


export function ExpensesTable({ month, year, collaboratorId }: ExpensesTableProps) {
  const { firestore, user } = useFirebase();
  const locale = 'es-ES';

  const expensesQuery = useMemoFirebase(() => {
     if (!user) return null;

    let q = query(collection(firestore, 'users', user.uid, 'expenses'), orderBy('date', 'desc'));
    
    // Date filter
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);
    if (!isNaN(parsedYear) && !isNaN(parsedMonth)) {
        const startDate = new Date(parsedYear, parsedMonth - 1, 1);
        const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59);
        q = query(q, where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
    }
    
    // Collaborator filter
    if(collaboratorId && collaboratorId !== 'all') {
        q = query(q, where('collaboratorId', '==', collaboratorId));
    }

    return q;
  }, [firestore, user, month, year, collaboratorId]);

  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const collaboratorsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'collaborators') : null
  , [firestore, user]);
  const { data: collaborators, isLoading: collaboratorsLoading } = useCollection<Collaborator>(collaboratorsQuery);

  const getCollaboratorName = (collaboratorId?: string) => {
    if (!collaboratorId) return 'N/A';
    if (!collaborators) return '...';
    return collaborators.find((c) => c.id === collaboratorId)?.name || 'N/A';
  };

  const isLoading = expensesLoading || collaboratorsLoading;

  const filteredExpenses = useMemo(() => {
    return expenses; // Query is already filtered
  }, [expenses]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!filteredExpenses || filteredExpenses.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
            No hay egresos para los filtros seleccionados.
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
          {filteredExpenses.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {new Date(item.date).toLocaleDateString(locale)}
              </TableCell>
              <TableCell className="font-medium">
                {getCollaboratorName(item.collaboratorId)}
              </TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.category}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-red-500">
                -{formatCurrency(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
