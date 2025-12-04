import { InvoiceForm } from "@/components/invoices/invoice-form";
import { mockCustomers, mockInvoices } from "@/lib/data";

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = mockInvoices.find(inv => inv.id === params.id || inv.invoiceNumber === params.id);
  
  return <InvoiceForm customers={mockCustomers} invoice={invoice} />;
}
