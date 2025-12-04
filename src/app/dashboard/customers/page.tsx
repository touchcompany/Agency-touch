import { CustomersTable } from "@/components/customers/customers-table";
import { AddCustomerSheet } from "@/components/customers/add-customer-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCustomers } from "@/lib/data";

export default function CustomersPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Customers</CardTitle>
        <AddCustomerSheet />
      </CardHeader>
      <CardContent>
        <CustomersTable customers={mockCustomers} />
      </CardContent>
    </Card>
  );
}
