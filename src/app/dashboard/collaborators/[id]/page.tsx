'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Collaborator, Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function CollaboratorDetailPage({ params: { id } }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();

  const collaboratorRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'collaborators', id) : null),
    [firestore, user, id]
  );
  const { data: collaborator, isLoading: collaboratorLoading } = useDoc<Collaborator>(collaboratorRef);

  const expensesQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'expenses'),
            where('collaboratorId', '==', id),
            orderBy('date', 'desc')
          )
        : null,
    [firestore, user, id]
  );
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const isLoading = collaboratorLoading || expensesLoading;
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collaborator) {
    return <p>Colaborador no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/collaborators"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-headline text-2xl font-bold">Detalles del Colaborador</h1>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start gap-6 sm:flex-row">
           <Avatar className="h-24 w-24 border">
              <AvatarImage src={`https://picsum.photos/seed/${collaborator.id}/200/200`} data-ai-hint="person" />
              <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-3xl font-headline">{collaborator.name}</CardTitle>
                 <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {collaborator.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{collaborator.email}</div>}
                    {collaborator.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{collaborator.phoneNumber}</div>}
                 </div>
            </div>
             <Button asChild>
                <Link href={`/dashboard/collaborators/${collaborator.id}/edit`}>Editar Colaborador</Link>
            </Button>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell><Badge variant="secondary">{expense.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium text-red-500">-{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center">Este colaborador no tiene pagos registrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
