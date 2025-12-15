'use client';

import { TransactionsTable } from '@/components/transactions/transactions-table';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpensesTable } from '@/components/transactions/expenses-table';
import { AddExpenseSheet } from '@/components/transactions/add-expense-sheet';

export default function TransactionsPage() {
  return (
    <Tabs defaultValue="income">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Egresos</TabsTrigger>
        </TabsList>
        <TabsContent value="income" className="m-0">
          <AddTransactionSheet />
        </TabsContent>
        <TabsContent value="expenses" className="m-0">
          <AddExpenseSheet />
        </TabsContent>
      </div>

      <TabsContent value="income">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="expenses">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
