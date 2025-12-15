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

export function AddTransactionSheet() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const [collaboratorId, setCollaboratorId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  
  const collaboratorsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'collaborators') : null
  , [firestore, user]);
  const { data: collaborators } = useCollection<Collaborator>(collaboratorsQuery);

  const handleSubmit = async () => {
    if (!firestore || !user || !amount || !description || !category) {
       toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos.',
      });
      return;
    }

    const incomeRef = collection(firestore, 'users', user.uid, 'income');
    addDocumentNonBlocking(incomeRef, {
      userId: user.uid,
      collaboratorId: collaboratorId || null,
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      description,
      category,
    });

    toast({
      title: 'Transacción añadida',
      description: 'El ingreso ha sido registrado.',
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
          Añadir Transacción
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">
            Añadir Nuevo Ingreso
          </SheetTitle>
          <SheetDescription>
            Registra un nuevo ingreso recibido.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collaborator" className="text-right">
              Colaborador
            </Label>
            <Select value={collaboratorId} onValueChange={setCollaboratorId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un colaborador" />
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
              placeholder="Ej: Abono a cuenta CTA-001"
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
            <Label htmlFor="type" className="text-right">
              Categoría
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salario">Salario</SelectItem>
                <SelectItem value="Inversiones">Inversiones</SelectItem>
                <SelectItem value="Ventas">Ventas</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Guardar Transacción
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
