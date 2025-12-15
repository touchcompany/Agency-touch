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
import type { Customer, Invoice, DetalleCuenta, Service } from '@/lib/types';
import {
  CalendarIcon,
  Plus,
  Trash,
  Upload,
  Download,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type CuentaFormProps = {
  cuenta?: Invoice;
};

// Mock data for services, will be replaced by firebase call
const mockServices: Service[] = [
    { id: '1', name: 'Diseño Web', description: 'Servicio completo de diseño y desarrollo web.', price: 1500 },
    { id: '2', name: 'Consultoría SEO', description: 'Optimización para motores de búsqueda.', price: 500 },
    { id: '3', name: 'Mantenimiento Web', description: 'Mantenimiento mensual del sitio web.', price: 200 },
];


export function CuentaForm({ cuenta }: CuentaFormProps) {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const customersQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'customers') : null),
    [firestore, user]
  );
  const { data: clientes } = useCollection<Customer>(customersQuery);

  const lastInvoiceQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'users', user.uid, 'invoices'), orderBy('invoiceNumber', 'desc'), limit(1)) : null,
    [firestore, user]
  );
  const { data: lastInvoiceArr } = useCollection<Invoice>(lastInvoiceQuery);

  const [customerId, setCustomerId] = useState(cuenta?.customerId || '');
  const [descripcion, setDescripcion] = useState(cuenta?.descripcion || '');
  const [detalle, setDetalle] = useState<Partial<DetalleCuenta>[]>(
    cuenta?.detalle || [{ descripcion: '', cantidad: 1, precio: 0 }]
  );
  const [fechaEmision, setFechaEmision] = useState<Date | undefined>(
    cuenta ? new Date(cuenta.issueDate) : new Date()
  );
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>(
    cuenta?.dueDate
      ? new Date(cuenta.dueDate)
      : new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [observaciones, setObservaciones] = useState(
    (cuenta as any)?.observaciones || ''
  );
  const [firmaUrl, setFirmaUrl] = useState((cuenta as any)?.firmaUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleItemChange = (
    index: number,
    field: keyof DetalleCuenta,
    value: string | number
  ) => {
    const newItems = [...detalle];
    (newItems[index] as any)[field] = value;
    setDetalle(newItems);
  };
  
  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = mockServices.find(s => s.id === serviceId);
    if(service) {
        const newItems = [...detalle];
        newItems[index].descripcion = service.name;
        newItems[index].precio = service.price;
        setDetalle(newItems);
    }
  };

  const addItem = () => {
    setDetalle([...detalle, { descripcion: '', cantidad: 1, precio: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = detalle.filter((_, i) => i !== index);
    setDetalle(newItems);
  };

  const subtotal = useMemo(() => detalle.reduce(
    (sum, item) => sum + (item.precio || 0) * (item.cantidad || 0),
    0
  ), [detalle]);

  const tax = subtotal * 0.19; // Example 19% tax (IVA Colombia)
  const total = subtotal + tax;

  const handleSave = async () => {
    if (!firestore || !user) {
      toast({ title: 'Error', description: 'No autenticado', variant: 'destructive' });
      return;
    }
    if (!customerId) {
        toast({ title: 'Error', description: 'Por favor, selecciona un cliente.', variant: 'destructive' });
        return;
    }

    let invoiceNumber = '1104';
    if(lastInvoiceArr && lastInvoiceArr.length > 0) {
        invoiceNumber = (parseInt(lastInvoiceArr[0].invoiceNumber) + 1).toString();
    }
    
    if (cuenta) {
      // Update existing invoice
      const invoiceRef = doc(firestore, 'users', user.uid, 'invoices', cuenta.id);
      setDocumentNonBlocking(invoiceRef, {
        customerId,
        descripcion,
        issueDate: fechaEmision?.toISOString(),
        dueDate: fechaVencimiento?.toISOString(),
        detalle,
        amountDue: total,
        observaciones,
        firmaUrl,
        status: cuenta.status,
      }, { merge: true });
      toast({ title: 'Cuenta actualizada', description: 'Los cambios han sido guardados.' });
      router.push('/dashboard/invoices');
    } else {
      // Create new invoice
      const invoicesRef = collection(firestore, 'users', user.uid, 'invoices');
      await addDocumentNonBlocking(invoicesRef, {
        userId: user.uid,
        invoiceNumber,
        customerId,
        descripcion,
        issueDate: fechaEmision?.toISOString(),
        dueDate: fechaVencimiento?.toISOString(),
        detalle,
        amountDue: total,
        observaciones,
        firmaUrl,
        status: 'sent', // default status
      });
      toast({ title: 'Cuenta creada', description: 'La nueva cuenta ha sido guardada.' });
      router.push('/dashboard/invoices');
    }
  };
  
  const handleFirmaUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Placeholder for upload logic
      console.log("File selected:", file.name);
      // In a real app, you would upload this file to Firebase Storage and get a URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFirmaUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({ title: 'Imagen cargada', description: 'La imagen de la firma se ha cargado localmente.'});
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="grid gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Cliente y Fechas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
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
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
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
                  <div className="col-span-6">
                    <Select onValueChange={(value) => handleServiceSelect(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona o describe un servicio"/>
                      </SelectTrigger>
                      <SelectContent>
                        {mockServices.map(service => (
                          <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
              <Plus className="mr-2 h-4 w-4" /> Añadir Servicio
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
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Firma</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-48 flex-shrink-0 items-center justify-center rounded-md border bg-muted">
                  {firmaUrl ? (
                    <img
                      src={firmaUrl}
                      alt="Firma"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleFirmaUploadClick}>
                  Subir Firma
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
            <Button onClick={handleSave}>
              {cuenta ? 'Guardar Cambios' : 'Crear Cuenta de Cobro'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => alert('Funcionalidad de PDF en desarrollo.')}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => alert('Funcionalidad de Correo en desarrollo.')}>
              <Send className="mr-2 h-4 w-4" /> Correo
            </Button>
            <Button variant="outline" className="col-span-2" onClick={() => alert('Funcionalidad de WhatsApp en desarrollo.')}>
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
