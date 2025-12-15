
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
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

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

  const [isMonthly, setIsMonthly] = useState(collaborator.isMonthly || false);
  const [paymentDay, setPaymentDay] = useState(collaborator.paymentDay?.toString() || '');
  const [defaultPaymentAmount, setDefaultPaymentAmount] = useState(collaborator.defaultPaymentAmount?.toString() || '');
  const [defaultPaymentDescription, setDefaultPaymentDescription] = useState(collaborator.defaultPaymentDescription || 'Nómina Mensual');
  const [defaultPaymentCategory, setDefaultPaymentCategory] = useState(collaborator.defaultPaymentCategory || 'Salario');


  useEffect(() => {
    setName(collaborator.name);
    setEmail(collaborator.email || '');
    setPhone(collaborator.phoneNumber || '');
    setIsMonthly(collaborator.isMonthly || false);
    setPaymentDay(collaborator.paymentDay?.toString() || '');
    setDefaultPaymentAmount(collaborator.defaultPaymentAmount?.toString() || '');
    setDefaultPaymentDescription(collaborator.defaultPaymentDescription || 'Nómina Mensual');
    setDefaultPaymentCategory(collaborator.defaultPaymentCategory || 'Salario');
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
      isMonthly,
      paymentDay: isMonthly ? parseInt(paymentDay) : null,
      defaultPaymentAmount: isMonthly ? parseFloat(defaultPaymentAmount) : null,
      defaultPaymentDescription: isMonthly ? defaultPaymentDescription : null,
      defaultPaymentCategory: isMonthly ? defaultPaymentCategory : null,
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
      
      <Separator className="my-4" />

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-row items-center justify-between">
            <Label htmlFor="monthly-payment" className="flex flex-col space-y-1">
                <span>Pagos Mensuales Automáticos</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Activa para generar pagos de nómina automáticamente.
                </span>
            </Label>
            <Switch
                id="monthly-payment"
                checked={isMonthly}
                onCheckedChange={setIsMonthly}
            />
        </div>

        {isMonthly && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid gap-2">
              <Label htmlFor="payment-day">
                Día del Mes para Pagar (1-31)
              </Label>
              <Input
                id="payment-day"
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                placeholder="Ej: 15 o 30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-payment-amount">
                Monto Fijo del Pago
              </Label>
              <Input
                  id="default-payment-amount"
                  type="number"
                  value={defaultPaymentAmount}
                  onChange={(e) => setDefaultPaymentAmount(e.target.value)}
                  placeholder="Monto del pago mensual"
              />
            </div>
            <div className="grid gap-2">
                  <Label htmlFor="default-payment-desc">Descripción por Defecto</Label>
                  <Input
                    id="default-payment-desc"
                    value={defaultPaymentDescription}
                    onChange={(e) => setDefaultPaymentDescription(e.target.value)}
                  />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="default-payment-category">Categoría por Defecto</Label>
                  <Select value={defaultPaymentCategory} onValueChange={setDefaultPaymentCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salario">Salario</SelectItem>
                      <SelectItem value="Servicios">Servicios</SelectItem>
                      <SelectItem value="Comisiones">Comisiones</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
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
