import { InvoicesTable } from "@/components/invoices/invoices-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockInvoices } from "@/lib/data";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function InvoicesPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Invoices</CardTitle>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <InvoicesTable invoices={mockInvoices} />
      </CardContent>
    </Card>
  );
}
