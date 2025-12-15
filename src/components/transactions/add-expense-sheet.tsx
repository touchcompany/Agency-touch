
'use client';
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirebase, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Collaborator } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { categorizeExpenseAction } from '@/app/actions/transactions';

export function AddExpenseSheet() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const [collaboratorId, setCollaboratorId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  
  const collaboratorsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'collaborators') : null
  , [firestore, user]);
  const { data: collaborators } = useCollection<Collaborator>(collaboratorsQuery);

  const handleDescriptionBlur = async () => {
    if (description && !category) {
      setIsCategorizing(true);
      const result = await categorizeExpenseAction(description);
      if (result.success && result.category) {
        setCategory(result.category);
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error de categorización',
          description: result.error,
        });
      }
      setIsCategorizing(false);
    }
  };

  const handleSubmit = async () => {
    if (!firestore || !user || !amount || !description || !category) {
       toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos.',
      });
      return;
    }

    const expensesRef = collection(firestore, 'users', user.uid, 'expenses');
    addDocumentNonBlocking(expensesRef, {
      userId: user.uid,
      collaboratorId: collaboratorId || null,
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      description,
      category,
    });

    toast({
      title: 'Egreso añadido',
      description: 'El egreso ha sido registrado.',
    });

    // Reset fields
    setCollaboratorId('');
    setDescription('');
    setAmount('');
    setCategory('');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Egreso
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">
            Añadir Nuevo Egreso
          </SheetTitle>
          <SheetDescription>
            Registra un nuevo pago o gasto realizado.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collaborator" className="text-right">
              Colaborador
            </Label>
            <Select value={collaboratorId} onValueChange={setCollaboratorId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un colaborador (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {(collaborators || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Ej: Pago de nómina"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Monto
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoría
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={isCategorizing ? "Categorizando con IA..." : "Selecciona categoría"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Comida">Comida</SelectItem>
                <SelectItem value="Transporte">Transporte</SelectItem>
                <SelectItem value="Servicios">Servicios</SelectItem>
                <SelectItem value="Alquiler">Alquiler</SelectItem>
                <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                <SelectItem value="Compras">Compras</SelectItem>
                <SelectItem value="Viajes">Viajes</SelectItem>
                <SelectItem value="Salario">Salario</SelectItem>
                <SelectItem value="Inversiones">Inversiones</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Guardar Egreso
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
