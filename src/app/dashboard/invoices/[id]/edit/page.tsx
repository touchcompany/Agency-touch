'use client';
import { CuentaForm } from '@/components/invoices/invoice-form';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function EditCuentaPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();

  const invoiceRef = useMemoFirebase(
    () =>
      user
        ? (doc(firestore, 'users', user.uid, 'invoices', params.id))
        : null,
    [firestore, user, params.id]
  );
  const { data: invoice, isLoading } = useDoc<Invoice>(invoiceRef);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <CuentaForm cuenta={invoice as Invoice} />;
}
