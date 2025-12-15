'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';

interface ServiceFormProps {
  service: Service;
}

export function ServiceForm({ service }: ServiceFormProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || '');
  const [price, setPrice] = useState(service.price.toString());

  useEffect(() => {
    setName(service.name);
    setDescription(service.description || '');
    setPrice(service.price.toString());
  }, [service]);

  const handleSubmit = async () => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar a la base de datos.',
      });
      return;
    }

    if (!name || !price) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'El nombre y el precio del servicio son obligatorios.',
      });
      return;
    }

    const serviceRef = doc(firestore, 'users', user.uid, 'services', service.id);
    setDocumentNonBlocking(serviceRef, {
      ...service,
      name,
      description,
      price: parseFloat(price),
    }, { merge: true });

    toast({
      title: 'Servicio Actualizado',
      description: `Los datos de ${name} han sido actualizados.`,
    });

    router.push('/dashboard/services');
  };

  return (
    <div className="grid gap-6 max-w-xl mx-auto">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Diseño Web"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el servicio"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Precio</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={() => router.push('/dashboard/services')}>
            Cancelar
         </Button>
         <Button onClick={handleSubmit}>
           Guardar Cambios
         </Button>
      </div>
    </div>
  );
}
