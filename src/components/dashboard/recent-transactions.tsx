import { mockPagos, mockClientes } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function RecentTransactions() {
  const recent = mockPagos.slice(0, 5);
  const locale = 'es-ES';

  const getClientName = (clientId: string) => {
    return mockClientes.find(c => c.id === clientId)?.nombre || "Cliente Desconocido";
  }
  
  const getClientAvatar = (clientId: string) => {
    const client = mockClientes.find(c => c.id === clientId);
    return client?.logoUrl || `https://picsum.photos/seed/${clientId}/100/100`;
  }

  return (
    <div className="space-y-4">
      {recent.map((pago) => (
        <div key={pago.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
             <AvatarImage src={getClientAvatar(pago.clienteId)} data-ai-hint="person" />
            <AvatarFallback>{getClientName(pago.clienteId).charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {pago.descripcion}
            </p>
            <p className="text-sm text-muted-foreground">
              {getClientName(pago.clienteId)}
            </p>
          </div>
          <div
            className={`font-medium text-green-500`}
          >
            +{formatCurrency(pago.monto)}
          </div>
        </div>
      ))}
    </div>
  );
}
