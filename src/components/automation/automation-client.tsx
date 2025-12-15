'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Customer, Service, Invoice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AutomationClient() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const recurringCustomersQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'users', user.uid, 'customers'),
            where('isMonthly', '==', true)
          )
        : null,
    [firestore, user]
  );
  const { data: recurringCustomers, isLoading: customersLoading } = useCollection<Customer>(recurringCustomersQuery);

  const servicesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'services') : null),
    [firestore, user]
  );
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);

  const getServiceName = (serviceId?: string) => {
    if (!serviceId || !services) return 'Servicio no especificado';
    return services.find((s) => s.id === serviceId)?.name || 'Servicio no encontrado';
  };
  
  const handleGenerateInvoices = async () => {
    if (!user || !firestore || !recurringCustomers || !services) {
        toast({ title: "Error", description: "No se pudieron cargar los datos necesarios.", variant: "destructive"});
        return;
    }

    setIsGenerating(true);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let generatedCount = 0;

    const invoicesRef = collection(firestore, 'users', user.uid, 'invoices');
    const lastInvoiceQuery = query(invoicesRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(lastInvoiceQuery);
    let lastInvoiceNumber = 1103;
    if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
            const num = parseInt(doc.data().invoiceNumber, 10);
            if(num > lastInvoiceNumber) {
                lastInvoiceNumber = num;
            }
        });
    }

    for (const customer of recurringCustomers) {
        if (!customer.invoiceDay) continue;

        const invoiceDate = new Date(currentYear, currentMonth, customer.invoiceDay);
        
        // Check if an invoice for this customer and month already exists
        const existingInvoiceQuery = query(invoicesRef, 
            where('customerId', '==', customer.id),
            where('userId', '==', user.uid),
        );
        const existingInvoicesSnapshot = await getDocs(existingInvoiceQuery);
        const alreadyExists = existingInvoicesSnapshot.docs.some(doc => {
            const invoice = doc.data() as Invoice;
            const issueDate = new Date(invoice.issueDate);
            return issueDate.getMonth() === currentMonth && issueDate.getFullYear() === currentYear;
        });

        if (alreadyExists) {
            console.log(`Invoice for ${customer.name} this month already exists. Skipping.`);
            continue;
        }

        const service = services.find(s => s.id === customer.defaultServiceId);
        if (!service) {
            console.log(`Default service not found for ${customer.name}. Skipping.`);
            continue;
        }

        lastInvoiceNumber++;

        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 5);

        const newInvoice = {
            userId: user.uid,
            customerId: customer.id,
            invoiceNumber: lastInvoiceNumber.toString(),
            issueDate: invoiceDate.toISOString(),
            dueDate: dueDate.toISOString(),
            detalle: [{
                id: service.id,
                descripcion: service.name,
                cantidad: 1,
                precio: service.price,
            }],
            amountDue: service.price,
            status: 'sent',
            descripcion: `Facturación mensual: ${service.name}`,
        };

        await addDocumentNonBlocking(invoicesRef, newInvoice);
        generatedCount++;
    }

    setIsGenerating(false);
    if(generatedCount > 0) {
      toast({ title: "Generación Completa", description: `${generatedCount} cuentas de cobro han sido generadas.` });
    } else {
      toast({ title: "Nada que generar", description: "Las cuentas para este mes ya existen o no hay clientes configurados." });
    }
  };


  const isLoading = customersLoading || servicesLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Clientes con facturación mensual automática activada.
        </p>
        <Button onClick={handleGenerateInvoices} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generando...' : 'Generar Cuentas Mensuales'}
        </Button>
      </div>

      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !recurringCustomers || recurringCustomers.length === 0 ? (
          <p className="text-center p-8 text-muted-foreground">
            No tienes clientes con facturación automática configurada.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Día de Facturación</TableHead>
                <TableHead>Servicio por Defecto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Día {customer.invoiceDay}</Badge>
                  </TableCell>
                  <TableCell>{getServiceName(customer.defaultServiceId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
