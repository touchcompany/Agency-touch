'use client';
import { CustomerForm } from '@/components/customers/customer-form';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Customer } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { use } from 'react';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { firestore, user } = useFirebase();

  const customerRef = useMemoFirebase(
    () =>
      user
        ? (doc(firestore, 'users', user.uid, 'customers', id))
        : null,
    [firestore, user, id]
  );
  const { data: customer, isLoading } = useDoc<Customer>(customerRef);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Editar Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        {customer ? <CustomerForm customer={customer} /> : <p>Cliente no encontrado.</p>}
      </CardContent>
    </Card>
  );
}
