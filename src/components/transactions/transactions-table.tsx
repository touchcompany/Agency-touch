import type { Pago } from "@/lib/types";
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
import { mockClientes } from "@/lib/data";

type PagosTableProps = {
  pagos: Pago[];
};

export function PagosTable({ pagos }: PagosTableProps) {
  const locale = 'es-ES';
  
  const getClientName = (clientId: string) => {
    return mockClientes.find(c => c.id === clientId)?.nombre || "N/A";
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagos.map((pago) => (
            <TableRow key={pago.id}>
              <TableCell>{new Date(pago.fechaPago).toLocaleDateString(locale)}</TableCell>
              <TableCell className="font-medium">{getClientName(pago.clienteId)}</TableCell>
              <TableCell>{pago.descripcion}</TableCell>
              <TableCell>
                <Badge variant="secondary">{pago.metodoPago}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-green-500">
                +{formatCurrency(pago.monto)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
