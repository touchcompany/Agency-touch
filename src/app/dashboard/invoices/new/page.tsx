import { InvoiceForm } from "@/components/invoices/invoice-form";
import { mockCustomers } from "@/lib/data";

export default function NewInvoicePage() {
  return <InvoiceForm customers={mockCustomers} />;
}
