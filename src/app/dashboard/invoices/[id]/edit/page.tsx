import { CuentaForm } from "@/components/invoices/invoice-form";
import { mockClientes, mockCuentas } from "@/lib/data";

export default function EditCuentaPage({ params }: { params: { id: string } }) {
  const cuenta = mockCuentas.find(inv => inv.id === params.id || inv.numeroCuenta === params.id);
  
  return <CuentaForm clientes={mockClientes} cuenta={cuenta} />;
}
