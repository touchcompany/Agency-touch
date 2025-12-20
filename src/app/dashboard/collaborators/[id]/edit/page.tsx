'use client';
import { CollaboratorForm } from '@/components/collaborators/collaborator-form';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Collaborator } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditCollaboratorPage({ params }: { params: { id: string } }) {
  const { firestore, user } = useFirebase();
  const { id } = params;

  const collaboratorRef = useMemoFirebase(
    () =>
      user
        ? (doc(firestore, 'users', user.uid, 'collaborators', id))
        : null,
    [firestore, user, id]
  );
  const { data: collaborator, isLoading } = useDoc<Collaborator>(collaboratorRef);

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
        <CardTitle className="font-headline">Editar Colaborador</CardTitle>
      </CardHeader>
      <CardContent>
        {collaborator ? <CollaboratorForm collaborator={collaborator} /> : <p>Colaborador no encontrado.</p>}
      </CardContent>
    </Card>
  );
}
