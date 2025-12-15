'use client';
import type { Cliente } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export function CustomersTable() {
  const { firestore, user } = useFirebase();

  const customersQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers, isLoading } = useCollection<Cliente>(customersQuery);

  // TODO: Add calculation for total spent from invoices
  const calculateTotalSpent = (customer: Cliente) => 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No hay clientes todavía. ¡Añade uno para empezar!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Correo Electrónico</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="text-right">Total Gastado</TableHead>
            <TableHead className="w-[50px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${customer.id}/100/100`}
                      data-ai-hint="person"
                    />
                    <AvatarFallback>
                      {customer.name?.charAt(0) ?? ''}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{customer.name}</span>
                </div>
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phoneNumber}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateTotalSpent(customer))}
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
                    <DropdownMenuItem>Editar Cliente</DropdownMenuItem>
                    <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
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
