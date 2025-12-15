'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Phone, MapPin, FileText, ArrowLeft } from 'lucide-react';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Customer, Invoice } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  paid: 'default',
  sent: 'secondary',
  overdue: 'destructive',
};

const statusTranslations: { [key: string]: string } = {
  paid: 'Pagada',
  sent: 'Pendiente',
  overdue: 'Vencida',
};

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();
  const customerId = params.id;

  const customerRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'customers', customerId) : null),
    [firestore, user, customerId]
  );
  const { data: customer, isLoading: customerLoading } = useDoc<Customer>(customerRef);

  const invoicesQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'invoices'),
            where('customerId', '==', customerId),
            orderBy('issueDate', 'desc')
          )
        : null,
    [firestore, user, customerId]
  );
  const { data: invoices, isLoading: invoicesLoading } = useCollection<Invoice>(invoicesQuery);

  const isLoading = customerLoading || invoicesLoading;
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return <p>Cliente no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="font-headline text-2xl font-bold">Detalles del Cliente</h1>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start gap-6 sm:flex-row">
           <Avatar className="h-24 w-24 border">
              <AvatarImage src={customer.logoUrl || `https://picsum.photos/seed/${customer.id}/200/200`} data-ai-hint="logo" />
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-3xl font-headline">{customer.name}</CardTitle>
                {customer.nit && <CardDescription>NIT: {customer.nit}</CardDescription>}
                 <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {customer.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{customer.email}</div>}
                    {customer.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{customer.phoneNumber}</div>}
                    {customer.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{customer.address}</div>}
                 </div>
            </div>
             <Button asChild>
                <Link href={`/dashboard/customers/${customer.id}/edit`}>Editar Cliente</Link>
            </Button>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Historial de Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Cuenta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell><Badge variant={statusVariant[invoice.status] || 'outline'}>{statusTranslations[invoice.status]}</Badge></TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amountDue)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                           <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center">Este cliente no tiene cuentas asociadas todavía.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
