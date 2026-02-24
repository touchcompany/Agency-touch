'use client';
import type { Invoice, Customer, CompanyProfile } from '@/lib/types';
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
import { MoreHorizontal, Loader2, Download, Send, MessageCircle, Mail } from 'lucide-react';
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
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { InvoicePrintLayout } from './invoice-print-layout';
import React, { useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';

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

interface CuentasTableProps {
  month: string;
  year: string;
  customerId: string;
}

export function CuentasTable({ month, year, customerId }: CuentasTableProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const locale = 'es-ES';

  const invoicesQuery = useMemoFirebase(() => {
    if (!user) return null;
    let q = query(collection(firestore, 'users', user.uid, 'invoices'), orderBy('issueDate', 'desc'));

    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);
    if (!isNaN(parsedYear) && !isNaN(parsedMonth)) {
        const startDate = new Date(parsedYear, parsedMonth - 1, 1);
        const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59);
        q = query(q, where('issueDate', '>=', startDate.toISOString()), where('issueDate', '<=', endDate.toISOString()));
    }
    
    return q;
  }, [firestore, user, month, year]);
  const { data: invoices, isLoading: invoicesLoading } = useCollection<Invoice>(invoicesQuery);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return null;
    if (customerId && customerId !== 'all') {
      return invoices.filter((invoice) => invoice.customerId === customerId);
    }
    return invoices;
  }, [invoices, customerId]);

  const customersQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const companyProfilesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'companyProfiles') : null),
    [firestore, user]
  );
  const { data: companyProfiles, isLoading: profilesLoading } = useCollection<CompanyProfile>(companyProfilesQuery);


  const getClientName = (customerId: string) => {
    if (!customers) return '...';
    return customers.find((c) => c.id === customerId)?.name || 'Cliente Desconocido';
  };
  
  const isLoading = invoicesLoading || customersLoading || profilesLoading;

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (!firestore || !user) {
      toast({ title: "Error", description: "No autenticado", variant: "destructive" });
      return;
    }

    const invoiceRef = doc(firestore, 'users', user.uid, 'invoices', invoice.id);
    setDocumentNonBlocking(invoiceRef, { status: 'paid' }, { merge: true });

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

  const handleSendWhatsApp = (invoice: Invoice) => {
    const customer = customers?.find(c => c.id === invoice.customerId);

    if (!customer || !customer.phoneNumber) {
      toast({
        variant: "destructive",
        title: "Falta número de teléfono",
        description: "Este cliente no tiene un número de WhatsApp registrado.",
      });
      return;
    }

    const dueDateFormatted = invoice.dueDate
      ? format(new Date(invoice.dueDate), 'PPP', { locale: es })
      : 'N/A';

    const message = `Hola ${customer.name}, te envío la cuenta de cobro No. *${invoice.invoiceNumber}* por un valor de *${formatCurrency(invoice.amountDue)}*. La fecha de vencimiento es el ${dueDateFormatted}. ¡Gracias!`;
    const whatsappUrl = `https://wa.me/${customer.phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };
  
  const handlePrint = (invoiceToPrint: Invoice) => {
    const customer = customers?.find(c => c.id === invoiceToPrint.customerId);
    const companyProfile = companyProfiles?.find(p => p.id === invoiceToPrint.companyProfileId);
    
    if (!customer || !companyProfile) {
        toast({ title: "Error", description: "Faltan datos de cliente o perfil de empresa.", variant: "destructive" });
        return;
    }

    const invoiceElement = <InvoicePrintLayout invoice={invoiceToPrint} customer={customer} companyProfile={companyProfile} />;
    const invoiceHtml = ReactDOMServer.renderToString(invoiceElement);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cuenta de Cobro ${invoiceToPrint.invoiceNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body { font-family: 'Inter', sans-serif; }
              @page { size: A4; margin: 0; }
            </style>
          </head>
          <body>
            ${invoiceHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!filteredInvoices || filteredInvoices.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No hay cuentas para los filtros seleccionados.
      </div>
    );
  }

  return (
    <>
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
            {filteredInvoices.map((invoice) => (
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
                          <DropdownMenuItem onSelect={() => handlePrint(invoice)}>
                              <Download className="mr-2 h-4 w-4" />
                              Ver / Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendWhatsApp(invoice)}>
                             <MessageCircle className="mr-2 h-4 w-4" />
                             Enviar por WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Funcionalidad de correo en desarrollo.')}>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar por Correo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
