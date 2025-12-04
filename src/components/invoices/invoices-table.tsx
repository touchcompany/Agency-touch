import type { Cuenta } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { mockClientes } from "@/lib/data";

type CuentasTableProps = {
  cuentas: Cuenta[];
};

const statusVariant = {
  pagada: "default",
  pendiente: "secondary",
  vencida: "destructive",
} as const;

const statusTranslations: { [key in keyof typeof statusVariant]: string } = {
    pagada: "Pagada",
    pendiente: "Pendiente",
    vencida: "Vencida",
};

const getClientName = (clientId: string) => {
    return mockClientes.find(c => c.id === clientId)?.nombre || "Cliente Desconocido";
}

export function CuentasTable({ cuentas }: CuentasTableProps) {
  const locale = 'es-ES';

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Nº Cuenta</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha de Emisión</TableHead>
            <TableHead>Fecha de Vencimiento</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-[50px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cuentas.map((cuenta) => (
            <TableRow key={cuenta.id}>
              <TableCell>
                <Badge variant={statusVariant[cuenta.status]} className="capitalize">
                  {statusTranslations[cuenta.status]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{cuenta.numeroCuenta}</TableCell>
              <TableCell>{getClientName(cuenta.clienteId)}</TableCell>
              <TableCell>{new Date(cuenta.fechaEmision).toLocaleDateString(locale)}</TableCell>
              <TableCell>{cuenta.fechaVencimiento ? new Date(cuenta.fechaVencimiento).toLocaleDateString(locale) : 'N/A'}</TableCell>
              <TableCell className="text-right">{formatCurrency(cuenta.valorTotal)}</TableCell>
               <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link href={`/dashboard/invoices/${cuenta.id}/edit`}>Editar</Link></DropdownMenuItem>
                    <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                    <DropdownMenuItem>Enviar Correo</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
