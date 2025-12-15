
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
import { Separator } from '../ui/separator';

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
          <div className="space-y-4">
            <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del Colaborador"
                />
            </div>
            <div>
                <Label htmlFor="email">Correo</Label>
                <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@ejemplo.com"
                />
            </div>
            <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555-0123"
                />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-row items-center justify-between">
                <Label htmlFor="monthly-payment" className="flex flex-col space-y-1">
                    <span>Pagos Mensuales Automáticos</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                        Activa para generar pagos automáticamente.
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
                    <div>
                        <Label htmlFor="payment-day">Día de Pago (1-31)</Label>
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
                     <div>
                        <Label htmlFor="default-payment-amount">Monto Fijo</Label>
                        <Input
                        id="default-payment-amount"
                        type="number"
                        value={defaultPaymentAmount}
                        onChange={(e) => setDefaultPaymentAmount(e.target.value)}
                        placeholder="Ej: 2000000"
                        />
                    </div>
                     <div>
                        <Label htmlFor="default-payment-desc">Descripción por Defecto</Label>
                        <Input
                        id="default-payment-desc"
                        value={defaultPaymentDescription}
                        onChange={(e) => setDefaultPaymentDescription(e.target.value)}
                        />
                    </div>
                    <div>
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
