'use client';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Service } from '@/lib/types';


export function AddCustomerSheet() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [nit, setNit] = useState('');

  const [isMonthly, setIsMonthly] = useState(false);
  const [invoiceDay, setInvoiceDay] = useState('');
  const [defaultServiceId, setDefaultServiceId] = useState('');

  const servicesQuery = useMemoFirebase(() => (
    user ? collection(firestore, 'users', user.uid, 'services') : null
  ), [firestore, user]);
  const { data: services } = useCollection<Service>(servicesQuery);

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

    const customersRef = collection(firestore, 'users', user.uid, 'customers');
    addDocumentNonBlocking(customersRef, {
      userId: user.uid,
      name,
      email,
      phoneNumber: phone,
      address,
      nit,
      createdAt: new Date().toISOString(),
      isMonthly,
      invoiceDay: isMonthly ? parseInt(invoiceDay) : null,
      defaultServiceId: isMonthly ? defaultServiceId : null,
    });

    toast({
      title: 'Cliente añadido',
      description: `${name} ha sido añadido a tu lista de clientes.`,
    });

    // Reset fields
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNit('');
    setIsMonthly(false);
    setInvoiceDay('');
    setDefaultServiceId('');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Cliente
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline">Añadir Nuevo Cliente</SheetTitle>
          <SheetDescription>
            Añade un nuevo cliente a tu base de datos y configura la facturación recurrente si es necesario.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del Cliente"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nit" className="text-right">
              NIT
            </Label>
            <Input
              id="nit"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="Número de NIT"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Correo
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Teléfono
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="555-0123"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Dirección
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Calle Principal"
              className="col-span-3"
            />
          </div>
          
          <div className="col-span-4 my-4 h-px bg-border" />

          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="monthly-billing" className="text-right col-span-3">
               Facturación Mensual Automática
             </Label>
             <Switch
                id="monthly-billing"
                checked={isMonthly}
                onCheckedChange={setIsMonthly}
             />
          </div>

          {isMonthly && (
            <>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invoice-day" className="text-right">
                  Día del Mes
                </Label>
                <Input
                  id="invoice-day"
                  type="number"
                  min="1"
                  max="31"
                  value={invoiceDay}
                  onChange={(e) => setInvoiceDay(e.target.value)}
                  placeholder="Ej: 15"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="default-service" className="text-right">
                  Servicio por Defecto
                </Label>
                 <Select value={defaultServiceId} onValueChange={setDefaultServiceId}>
                  <SelectTrigger className="col-span-3">
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
            </>
          )}

        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Guardar Cliente
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
