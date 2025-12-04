import { CuentaForm } from "@/components/invoices/invoice-form";
import { mockClientes } from "@/lib/data";

export default function NewCuentaPage() {
  return <CuentaForm clientes={mockClientes} />;
}
