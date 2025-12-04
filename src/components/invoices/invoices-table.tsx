import type { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type InvoicesTableProps = {
  invoices: Invoice[];
};

const statusVariant = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
} as const;

const statusTranslations: { [key in keyof typeof statusVariant]: string } = {
    paid: "Pagada",
    pending: "Pendiente",
    overdue: "Vencida",
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const calculateTotal = (invoice: Invoice) =>
    invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const locale = 'es-ES';

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Factura</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha de Emisión</TableHead>
            <TableHead>Fecha de Vencimiento</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-[50px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Badge variant={statusVariant[invoice.status]} className="capitalize">
                  {statusTranslations[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.customer.name}</TableCell>
              <TableCell>{new Date(invoice.issueDate).toLocaleDateString(locale)}</TableCell>
              <TableCell>{new Date(invoice.dueDate).toLocaleDateString(locale)}</TableCell>
              <TableCell className="text-right">{formatCurrency(calculateTotal(invoice))}</TableCell>
               <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link href={`/dashboard/invoices/${invoice.id}/edit`}>Editar</Link></DropdownMenuItem>
                    <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                    <DropdownMenuItem>Enviar Correo</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
