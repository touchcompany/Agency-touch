'use client';
import { AddCustomerSheet } from '@/components/customers/add-customer-sheet';
import { CustomersTable } from '@/components/customers/customers-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Clientes</CardTitle>
        <AddCustomerSheet />
      </CardHeader>
      <CardContent>
        <CustomersTable />
      </CardContent>
    </Card>
  );
}
