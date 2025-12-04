import { PagosTable } from "@/components/pagos/pagos-table";
import { AddPagoSheet } from "@/components/pagos/add-pago-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPagos } from "@/lib/data";

export default function PagosPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Todos los Pagos</CardTitle>
        <AddPagoSheet />
      </CardHeader>
      <CardContent>
        <PagosTable pagos={mockPagos} />
      </CardContent>
    </Card>
  );
}
