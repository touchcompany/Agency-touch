'use client';
import { formatCurrency } from "@/lib/utils";
import type { Customer, Invoice, Service, DetalleCuenta } from "@/lib/types";
import Image from "next/image";
import { Separator } from "../ui/separator";

interface InvoicePrintLayoutProps {
    invoice: Invoice | undefined;
    customer: Customer | undefined;
}

const companyDetails = {
    name: 'FinancioAI',
    address: 'Calle Falsa 123, Springfield',
    phone: '+57 300 123 4567',
    email: 'contacto@financioai.co',
    logo: '/logo-placeholder.png'
}


export function InvoicePrintLayout({ invoice, customer }: InvoicePrintLayoutProps) {
    if (!invoice || !customer) {
        return <div className="p-10 text-center">Faltan datos de la cuenta o del cliente.</div>
    }

    const subtotal = invoice.detalle?.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 0), 0) || 0;
    const total = subtotal;

    return (
        <div className="bg-white text-gray-800 p-10 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
            <header className="flex justify-between items-start pb-8 border-b-2 border-gray-200">
                <div className="w-2/3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyDetails.name}</h1>
                    <p>{companyDetails.address}</p>
                    <p>{companyDetails.phone}</p>
                    <p>{companyDetails.email}</p>
                </div>
                <div className="w-1/3 text-right">
                    <h2 className="text-3xl font-bold text-gray-500 uppercase">Cuenta de Cobro</h2>
                    <p className="font-semibold text-gray-700 mt-2">No. {invoice.invoiceNumber}</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-8 my-8">
                <div>
                    <h3 className="text-gray-500 font-semibold mb-2">CLIENTE:</h3>
                    <p className="font-bold text-lg">{customer.name}</p>
                    <p>{customer.address}</p>
                    <p>{customer.phoneNumber}</p>
                    <p>{customer.email}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-gray-500 font-semibold mb-2">FECHA DE EMISIÓN:</h3>
                    <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-gray-500 font-semibold mt-4 mb-2">FECHA DE VENCIMIENTO:</h3>
                    <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </section>
            
            <section>
                 <table className="w-full text-left">
                     <thead>
                         <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                             <th className="p-3 w-1/2 font-semibold">Descripción</th>
                             <th className="p-3 text-center font-semibold">Cantidad</th>
                             <th className="p-3 text-right font-semibold">Precio Unitario</th>
                             <th className="p-3 text-right font-semibold">Total</th>
                         </tr>
                     </thead>
                     <tbody>
                         {invoice.detalle?.map((item, index) => (
                             <tr key={index} className="border-b border-gray-100">
                                 <td className="p-3">{item.descripcion}</td>
                                 <td className="p-3 text-center">{item.cantidad}</td>
                                 <td className="p-3 text-right">{formatCurrency(item.precio)}</td>
                                 <td className="p-3 text-right">{formatCurrency(item.precio * item.cantidad)}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
            </section>

             <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs">
                    <div className="flex justify-between py-2">
                        <span className="font-semibold text-gray-600">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <Separator className="my-2 bg-gray-200" />
                    <div className="flex justify-between py-2 text-xl">
                        <span className="font-bold">TOTAL:</span>
                        <span className="font-bold">{formatCurrency(total)}</span>
                    </div>
                </div>
            </section>
            
            <footer className="absolute bottom-10 left-10 right-10 text-xs text-gray-500">
                <Separator className="mb-4" />
                {invoice.observaciones && (
                    <div className="mb-4">
                        <h4 className="font-bold mb-1">Observaciones:</h4>
                        <p>{invoice.observaciones}</p>
                    </div>
                )}
                 <div className="mb-4">
                    <h4 className="font-bold mb-1">Información de Pago:</h4>
                    <p>Cuenta de Ahorros Bancolombia No. 123-456789-00 a nombre de FinancioAI S.A.S. (NIT: 900.123.456-7)</p>
                </div>
                <p className="text-center">¡Gracias por su negocio!</p>
            </footer>

        </div>
    );
}
