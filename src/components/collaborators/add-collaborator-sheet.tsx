
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
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function AddCollaboratorSheet() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isMonthly, setIsMonthly] = useState(false);
  const [paymentDay, setPaymentDay] = useState('');
  const [defaultPaymentAmount, setDefaultPaymentAmount] = useState('');
  const [defaultPaymentDescription, setDefaultPaymentDescription] = useState('Nómina Mensual');
  const [defaultPaymentCategory, setDefaultPaymentCategory] = useState('Salario');

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

    const collaboratorsRef = collection(firestore, 'users', user.uid, 'collaborators');
    addDocumentNonBlocking(collaboratorsRef, {
      userId: user.uid,
      name,
      email,
      phoneNumber: phone,
      createdAt: new Date().toISOString(),
      isMonthly,
      paymentDay: isMonthly ? parseInt(paymentDay) : null,
      defaultPaymentAmount: isMonthly ? parseFloat(defaultPaymentAmount) : null,
      defaultPaymentDescription: isMonthly ? defaultPaymentDescription : null,
      defaultPaymentCategory: isMonthly ? defaultPaymentCategory : null,
    });

    toast({
      title: 'Colaborador añadido',
      description: `${name} ha sido añadido a tu lista de colaboradores.`,
    });

    // Reset fields
    setName('');
    setEmail('');
    setPhone('');
    setIsMonthly(false);
    setPaymentDay('');
    setDefaultPaymentAmount('');
    setDefaultPaymentDescription('Nómina Mensual');
    setDefaultPaymentCategory('Salario');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Colaborador
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline">Añadir Nuevo Colaborador</SheetTitle>
          <SheetDescription>
            Añade los datos del colaborador y configura los pagos recurrentes si es necesario.
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
              placeholder="Nombre del Colaborador"
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
              placeholder="colaborador@ejemplo.com"
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

          <div className="col-span-4 my-4 h-px bg-border" />

          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="monthly-payment" className="text-right col-span-3">
               Pagos Mensuales Automáticos
             </Label>
             <Switch
                id="monthly-payment"
                checked={isMonthly}
                onCheckedChange={setIsMonthly}
             />
          </div>

          {isMonthly && (
            <>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-day" className="text-right">
                  Día de Pago
                </Label>
                <Input
                  id="payment-day"
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(e.target.value)}
                  placeholder="Ej: 15 o 30"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="default-payment-amount" className="text-right">
                  Monto Fijo
                </Label>
                <Input
                  id="default-payment-amount"
                  type="number"
                  value={defaultPaymentAmount}
                  onChange={(e) => setDefaultPaymentAmount(e.target.value)}
                  placeholder="Ej: 2000000"
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="default-payment-desc" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="default-payment-desc"
                  value={defaultPaymentDescription}
                  onChange={(e) => setDefaultPaymentDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="default-payment-category" className="text-right">
                  Categoría
                </Label>
                 <Select value={defaultPaymentCategory} onValueChange={setDefaultPaymentCategory}>
                  <SelectTrigger className="col-span-3">
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
            </>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Guardar Colaborador
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
