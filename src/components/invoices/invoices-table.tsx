'use client';
import type { Invoice, Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Loader2, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirebase, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  paid: 'default',
  sent: 'secondary',
  overdue: 'destructive',
};

const statusTranslations: { [key: string]: string } = {
  paid: 'Pagada',
  sent: 'Pendiente',
  overdue: 'Vencida',
};

export function CuentasTable() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const locale = 'es-ES';

  const invoicesQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'invoices') : null
  , [firestore, user]);
  const { data: invoices, isLoading: invoicesLoading } = useCollection<Invoice>(invoicesQuery);

  const customersQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const getClientName = (customerId: string) => {
    if (!customers) return '...';
    return customers.find((c) => c.id === customerId)?.name || 'Cliente Desconocido';
  };
  
  const isLoading = invoicesLoading || customersLoading;

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (!firestore || !user) {
      toast({ title: "Error", description: "No autenticado", variant: "destructive" });
      return;
    }

    // 1. Update invoice status
    const invoiceRef = doc(firestore, 'users', user.uid, 'invoices', invoice.id);
    setDocumentNonBlocking(invoiceRef, { status: 'paid' }, { merge: true });

    // 2. Create a new income transaction
    const incomeRef = collection(firestore, 'users', user.uid, 'income');
    addDocumentNonBlocking(incomeRef, {
      userId: user.uid,
      customerId: invoice.customerId,
      date: new Date().toISOString(),
      amount: invoice.amountDue,
      description: `Pago de la cuenta #${invoice.invoiceNumber}`,
      category: 'Ventas',
      invoiceId: invoice.id,
    });

    toast({
      title: "Cuenta Actualizada",
      description: `La cuenta #${invoice.invoiceNumber} ha sido marcada como pagada.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No hay cuentas todavía. ¡Crea una para empezar!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Nº Cuenta</TableHead>
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
                <Badge
                  variant={statusVariant[invoice.status]}
                  className="capitalize"
                >
                  {statusTranslations[invoice.status]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>{getClientName(invoice.customerId)}</TableCell>
              <TableCell>
                {new Date(invoice.issueDate).toLocaleDateString(locale)}
              </TableCell>
              <TableCell>
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString(locale)
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(invoice.amountDue)}
              </TableCell>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    {invoice.status !== 'paid' && (
                       <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                         Marcar como Pagada
                       </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                         <Download className="mr-2 h-4 w-4" />
                         Descargar PDF
                      </Link>
                    </DropdownMenuItem>
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
