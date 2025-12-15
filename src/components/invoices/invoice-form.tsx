'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Customer, Invoice, DetalleCuenta } from '@/lib/types';
import {
  CalendarIcon,
  Plus,
  Trash,
  Upload,
  Download,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

type CuentaFormProps = {
  cuenta?: Invoice;
};

export function CuentaForm({ cuenta }: CuentaFormProps) {
  const { firestore, user } = useFirebase();
  const customersQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'customers') : null),
    [firestore, user]
  );
  const { data: clientes } = useCollection<Customer>(customersQuery);

  const [detalle, setDetalle] = useState<Partial<DetalleCuenta>[]>(
    (cuenta as any)?.detalle || [{ descripcion: '', cantidad: 1, precio: 0 }]
  );
  const [fechaEmision, setFechaEmision] = useState<Date | undefined>(
    cuenta ? new Date(cuenta.issueDate) : new Date()
  );
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>(
    cuenta?.dueDate
      ? new Date(cuenta.dueDate)
      : new Date(new Date().setDate(new Date().getDate() + 30))
  );

  const handleItemChange = (
    index: number,
    field: keyof DetalleCuenta,
    value: string | number
  ) => {
    const newItems = [...detalle];
    (newItems[index] as any)[field] = value;
    setDetalle(newItems);
  };

  const addItem = () => {
    setDetalle([...detalle, { descripcion: '', cantidad: 1, precio: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = detalle.filter((_, i) => i !== index);
    setDetalle(newItems);
  };

  const subtotal = detalle.reduce(
    (sum, item) => sum + (item.precio || 0) * (item.cantidad || 0),
    0
  );
  const tax = subtotal * 0.19; // Example 19% tax (IVA Colombia)
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <form className="grid gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Cliente y Fechas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select defaultValue={cuenta?.customerId}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(clientes || []).map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                defaultValue={(cuenta as any)?.descripcion}
                placeholder="Ej: Servicios de consultoría"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-date">Fecha de Emisión</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !fechaEmision && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaEmision ? (
                      format(fechaEmision, 'PPP', { locale: es })
                    ) : (
                      <span>Elige una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaEmision}
                    onSelect={setFechaEmision}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Fecha de Vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !fechaVencimiento && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaVencimiento ? (
                      format(fechaVencimiento, 'PPP', { locale: es })
                    ) : (
                      <span>Elige una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaVencimiento}
                    onSelect={setFechaVencimiento}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Detalle de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detalle.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center gap-2"
                >
                  <Input
                    placeholder="Descripción del artículo"
                    className="col-span-6"
                    value={item.descripcion}
                    onChange={(e) =>
                      handleItemChange(index, 'descripcion', e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Cant."
                    className="col-span-2"
                    value={item.cantidad}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'cantidad',
                        parseInt(e.target.value, 10)
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Precio"
                    className="col-span-3"
                    value={item.precio}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'precio',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="col-span-1"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Añadir Artículo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Observaciones y Firma</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Añade notas u observaciones adicionales aquí."
                rows={3}
                defaultValue={(cuenta as any)?.observaciones}
              />
            </div>
            <div className="space-y-2">
              <Label>Firma</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-48 flex-shrink-0 items-center justify-center rounded-md border bg-muted">
                  {(cuenta as any)?.firmaUrl ? (
                    <img
                      src={(cuenta as any).firmaUrl}
                      alt="Firma"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" size="sm">
                  Subir Firma
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (19%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            <Button>
              {cuenta ? 'Guardar Cambios' : 'Crear Cuenta de Cobro'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" /> Correo
            </Button>
            <Button variant="outline" className="col-span-2">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
