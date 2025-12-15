'use client';

import { TransactionsTable } from '@/components/transactions/transactions-table';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TransactionsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Todas las Transacciones</CardTitle>
        <AddTransactionSheet />
      </CardHeader>
      <CardContent>
        <TransactionsTable />
      </CardContent>
    </Card>
  );
}
