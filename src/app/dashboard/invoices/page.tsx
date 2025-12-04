import { CuentasTable } from "@/components/invoices/invoices-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCuentas } from "@/lib/data";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CuentasPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Cuentas</CardTitle>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Cuenta
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <CuentasTable cuentas={mockCuentas} />
      </CardContent>
    </Card>
  );
}
