
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useFirebase, setDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Customer, Service } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

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

  const [isMonthly, setIsMonthly] = useState(customer.isMonthly || false);
  const [invoiceDay, setInvoiceDay] = useState(customer.invoiceDay?.toString() || '');
  const [defaultServiceId, setDefaultServiceId] = useState(customer.defaultServiceId || '');

  const servicesQuery = useMemoFirebase(() => (
    user ? collection(firestore, 'users', user.uid, 'services') : null
  ), [firestore, user]);
  const { data: services } = useCollection<Service>(servicesQuery);

  useEffect(() => {
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phoneNumber || '');
    setAddress(customer.address || '');
    setNit(customer.nit || '');
    setIsMonthly(customer.isMonthly || false);
    setInvoiceDay(customer.invoiceDay?.toString() || '');
    setDefaultServiceId(customer.defaultServiceId || '');
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
      isMonthly,
      invoiceDay: isMonthly ? parseInt(invoiceDay) : null,
      defaultServiceId: isMonthly ? defaultServiceId : null,
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

       <Separator className="my-4" />
       
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between">
              <Label htmlFor="monthly-billing" className="flex flex-col space-y-1">
                  <span>Facturación Mensual Automática</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                      Activa para generar cuentas de cobro automáticamente.
                  </span>
              </Label>
              <Switch
                  id="monthly-billing"
                  checked={isMonthly}
                  onCheckedChange={setIsMonthly}
              />
          </div>

        {isMonthly && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid gap-2">
              <Label htmlFor="invoice-day">
                Día del Mes para Facturar (1-31)
              </Label>
              <Input
                id="invoice-day"
                type="number"
                min="1"
                max="31"
                value={invoiceDay}
                onChange={(e) => setInvoiceDay(e.target.value)}
                placeholder="Ej: 15"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-service">
                Servicio por Defecto para Facturar
              </Label>
              <Select value={defaultServiceId} onValueChange={setDefaultServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {(services || []).map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>


      <div className="flex justify-end gap-2 mt-6">
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
