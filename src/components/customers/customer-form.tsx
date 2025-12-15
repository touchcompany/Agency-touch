'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface CustomerFormProps {
  customer: Customer;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email || '');
  const [phone, setPhone] = useState(customer.phoneNumber || '');
  const [address, setAddress] = useState(customer.address || '');
  const [nit, setNit] = useState(customer.nit || '');

  useEffect(() => {
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phoneNumber || '');
    setAddress(customer.address || '');
    setNit(customer.nit || '');
  }, [customer]);

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
        description: 'El nombre del cliente es obligatorio.',
      });
      return;
    }

    const customerRef = doc(firestore, 'users', user.uid, 'customers', customer.id);
    setDocumentNonBlocking(customerRef, {
      ...customer,
      name,
      email,
      phoneNumber: phone,
      address,
      nit,
    }, { merge: true });

    toast({
      title: 'Cliente Actualizado',
      description: `Los datos de ${name} han sido actualizados.`,
    });

    router.push('/dashboard/customers');
  };

  return (
    <div className="grid gap-6 max-w-xl mx-auto">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del Cliente"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nit">NIT</Label>
        <Input
          id="nit"
          value={nit}
          onChange={(e) => setNit(e.target.value)}
          placeholder="Número de NIT"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cliente@ejemplo.com"
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
      <div className="grid gap-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Calle Principal"
        />
      </div>
      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={() => router.push('/dashboard/customers')}>
            Cancelar
         </Button>
         <Button onClick={handleSubmit}>
           Guardar Cambios
         </Button>
      </div>
    </div>
  );
}
