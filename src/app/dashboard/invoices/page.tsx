'use client';
import { CuentasTable } from '@/components/invoices/invoices-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Customer } from '@/lib/types';


const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export default function CuentasPage() {
  const { firestore, user } = useFirebase();
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [customerId, setCustomerId] = useState<string>('all');
  
  const customersQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers } = useCollection<Customer>(customersQuery);
  
  const clearFilters = () => {
    setYear(new Date().getFullYear().toString());
    setMonth((new Date().getMonth() + 1).toString());
    setCustomerId('all');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Cuentas</h1>
           <p className="text-muted-foreground">
            Filtra y gestiona tus cuentas de cobro.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Cuenta
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
           <div className="flex w-full flex-wrap items-center gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {(customers || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Button variant="ghost" onClick={clearFilters}>Limpiar Filtros</Button>
          </div>
        </CardHeader>
        <CardContent>
          <CuentasTable month={month} year={year} customerId={customerId}/>
        </CardContent>
      </Card>
    </div>
  );
}
