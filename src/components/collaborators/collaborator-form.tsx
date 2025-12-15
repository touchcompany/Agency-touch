'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Collaborator } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface CollaboratorFormProps {
  collaborator: Collaborator;
}

export function CollaboratorForm({ collaborator }: CollaboratorFormProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState(collaborator.name);
  const [email, setEmail] = useState(collaborator.email || '');
  const [phone, setPhone] = useState(collaborator.phoneNumber || '');

  useEffect(() => {
    setName(collaborator.name);
    setEmail(collaborator.email || '');
    setPhone(collaborator.phoneNumber || '');
  }, [collaborator]);

  const handleSubmit = async () => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar a la base de datos.',
      });
      return;
    }

    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Campo requerido',
        description: 'El nombre del colaborador es obligatorio.',
      });
      return;
    }

    const collaboratorRef = doc(firestore, 'users', user.uid, 'collaborators', collaborator.id);
    setDocumentNonBlocking(collaboratorRef, {
      ...collaborator,
      name,
      email,
      phoneNumber: phone,
    }, { merge: true });

    toast({
      title: 'Colaborador Actualizado',
      description: `Los datos de ${name} han sido actualizados.`,
    });

    router.push('/dashboard/collaborators');
  };

  return (
    <div className="grid gap-6 max-w-xl mx-auto">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del Colaborador"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colaborador@ejemplo.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="555-0123"
        />
      </div>
      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={() => router.push('/dashboard/collaborators')}>
            Cancelar
         </Button>
         <Button onClick={handleSubmit}>
           Guardar Cambios
         </Button>
      </div>
    </div>
  );
}
