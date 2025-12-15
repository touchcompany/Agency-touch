'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Collaborator, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export function CollaboratorAutomationClient() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const recurringCollaboratorsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'collaborators'),
            where('isMonthly', '==', true)
          )
        : null,
    [firestore, user]
  );
  const { data: recurringCollaborators, isLoading } = useCollection<Collaborator>(recurringCollaboratorsQuery);

  const handleGeneratePayments = async () => {
    if (!user || !firestore || !recurringCollaborators) {
        toast({ title: "Error", description: "No se pudieron cargar los datos necesarios.", variant: "destructive"});
        return;
    }

    setIsGenerating(true);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let generatedCount = 0;

    const expensesRef = collection(firestore, 'users', user.uid, 'expenses');

    for (const collaborator of recurringCollaborators) {
        if (!collaborator.paymentDay || !collaborator.defaultPaymentAmount) continue;

        const paymentDate = new Date(currentYear, currentMonth, collaborator.paymentDay);
        
        // Check if a payment for this collaborator and month already exists
        const existingExpenseQuery = query(expensesRef, 
            where('collaboratorId', '==', collaborator.id),
            where('userId', '==', user.uid),
        );
        const existingExpensesSnapshot = await getDocs(existingExpenseQuery);
        const alreadyExists = existingExpensesSnapshot.docs.some(doc => {
            const expense = doc.data() as Expense;
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });

        if (alreadyExists) {
            console.log(`Payment for ${collaborator.name} this month already exists. Skipping.`);
            continue;
        }

        const newExpense = {
            userId: user.uid,
            collaboratorId: collaborator.id,
            date: paymentDate.toISOString(),
            amount: collaborator.defaultPaymentAmount,
            description: collaborator.defaultPaymentDescription || `Pago a ${collaborator.name}`,
            category: collaborator.defaultPaymentCategory || 'Salario',
        };

        await addDocumentNonBlocking(expensesRef, newExpense);
        generatedCount++;
    }

    setIsGenerating(false);
    if(generatedCount > 0) {
      toast({ title: "Generación Completa", description: `${generatedCount} egresos han sido generados.` });
    } else {
      toast({ title: "Nada que generar", description: "Los pagos para este mes ya existen o no hay colaboradores configurados." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Colaboradores con pagos mensuales automáticos activados.
        </p>
        <Button onClick={handleGeneratePayments} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generando...' : 'Generar Pagos Mensuales'}
        </Button>
      </div>

      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !recurringCollaborators || recurringCollaborators.length === 0 ? (
          <p className="text-center p-8 text-muted-foreground">
            No tienes colaboradores con pagos automáticos configurados.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Día de Pago</TableHead>
                <TableHead>Descripción por Defecto</TableHead>
                <TableHead className="text-right">Monto Fijo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringCollaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell className="font-medium">{collaborator.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Día {collaborator.paymentDay}</Badge>
                  </TableCell>
                  <TableCell>{collaborator.defaultPaymentDescription}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(collaborator.defaultPaymentAmount || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
