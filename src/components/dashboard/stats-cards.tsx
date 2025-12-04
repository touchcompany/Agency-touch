import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockPagos, mockCuentas } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Users, FileText, Banknote } from "lucide-react";

export function StatsCards() {
  const totalPagado = mockPagos.reduce((sum, p) => sum + p.monto, 0);
  
  const totalPendiente = mockCuentas
    .filter((c) => c.status === "pendiente" || c.status === "vencida")
    .reduce((sum, c) => sum + c.valorTotal, 0);

  const totalFacturado = mockCuentas.reduce((sum, c) => sum + c.valorTotal, 0);


  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recibido</CardTitle>
          <Banknote className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPagado)}</div>
          <p className="text-xs text-muted-foreground">Suma de todos los pagos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
          <FileText className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPendiente)}</div>
          <p className="text-xs text-muted-foreground">Total en cuentas por pagar</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalFacturado)}</div>
          <p className="text-xs text-muted-foreground">Suma de todas las cuentas</p>
        </CardContent>
      </Card>
    </div>
  );
}
