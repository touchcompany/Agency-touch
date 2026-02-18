
'use client';

import { useState } from 'react';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpensesTable } from '@/components/transactions/expenses-table';
import { AddExpenseSheet } from '@/components/transactions/add-expense-sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Customer, Collaborator } from '@/lib/types';
import { Button } from '@/components/ui/button';

const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export default function TransactionsPage() {
  const { firestore, user } = useFirebase();
  const [activeTab, setActiveTab] = useState('income');
  
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [customerId, setCustomerId] = useState<string>('all');
  const [collaboratorId, setCollaboratorId] = useState<string>('all');

  const customersQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers } = useCollection<Customer>(customersQuery);

  const collaboratorsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'collaborators') : null
  , [firestore, user]);
  const { data: collaborators } = useCollection<Collaborator>(collaboratorsQuery);
  
  const clearFilters = () => {
    setYear(new Date().getFullYear().toString());
    setMonth((new Date().getMonth() + 1).toString());
    setCustomerId('all');
    setCollaboratorId('all');
  }

  return (
    <Tabs defaultValue="income" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <TabsList>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Egresos</TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap items-center gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeTab === 'income' && (
                 <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {(customers || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}
            {activeTab === 'expenses' && (
                 <Select value={collaboratorId} onValueChange={setCollaboratorId}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Todos los colaboradores" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Todos los colaboradores</SelectItem>
                    {(collaborators || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            )}
             <Button variant="ghost" onClick={clearFilters}>Limpiar</Button>
        </div>
      </div>
      <TabsContent value="income">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-headline">Ingresos</CardTitle>
            <AddTransactionSheet />
          </CardHeader>
          <CardContent>
            <TransactionsTable month={month} year={year} customerId={customerId} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="expenses">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-headline">Egresos</CardTitle>
            <AddExpenseSheet />
          </CardHeader>
          <CardContent>
            <ExpensesTable month={month} year={year} collaboratorId={collaboratorId} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
