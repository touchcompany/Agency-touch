
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
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Egresos</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="income">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="font-headline">Ingresos</CardTitle>
            <AddTransactionSheet />
          </CardHeader>
          <CardContent>
            <TransactionsTable />
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
            <ExpensesTable />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
