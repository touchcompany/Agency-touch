'use client';
import { ServiceForm } from '@/components/services/service-form';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Service } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditServicePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { firestore, user } = useFirebase();

  const serviceRef = useMemoFirebase(
    () =>
      user
        ? (doc(firestore, 'users', user.uid, 'services', id))
        : null,
    [firestore, user, id]
  );
  const { data: service, isLoading } = useDoc<Service>(serviceRef);

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
        <CardTitle className="font-headline">Editar Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        {service ? <ServiceForm service={service} /> : <p>Servicio no encontrado.</p>}
      </CardContent>
    </Card>
  );
}
