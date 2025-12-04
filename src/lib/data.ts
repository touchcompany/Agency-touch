import type { Transaction, Customer, Invoice } from './types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Soluciones Tecnológicas Inc.',
    email: 'contacto@solucionestec.com',
    phone: '555-0101',
    address: '123 Calle Innovación, Silicon Valley, CA',
    paymentHistory: [],
  },
  {
    id: '2',
    name: 'Diseños Creativos Co.',
    email: 'hola@disenoscreativos.co',
    phone: '555-0102',
    address: '456 Avenida del Arte, Nueva York, NY',
    paymentHistory: [],
  },
  {
    id: '3',
    name: 'Exportaciones Globales Ltd.',
    email: 'ventas@exportacionesglobales.com',
    phone: '555-0103',
    address: '789 Calle Comercio, Londres, UK',
    paymentHistory: [],
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'FAC-001',
    customer: mockCustomers[0],
    issueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    items: [
      { id: '1', description: 'Desarrollo de Sitio Web', quantity: 1, price: 5000 },
      { id: '2', description: 'Hosting Mensual', quantity: 1, price: 100 },
    ],
    status: 'pending',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'FAC-002',
    customer: mockCustomers[1],
    issueDate: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    items: [{ id: '1', description: 'Diseño de Logo', quantity: 1, price: 1200 }],
    status: 'overdue',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'FAC-003',
    customer: mockCustomers[2],
    issueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    items: [{ id: '1', description: 'Servicios de Consultoría', quantity: 10, price: 250 }],
    status: 'paid',
  },
];

mockCustomers[0].paymentHistory = [mockInvoices[0]];
mockCustomers[1].paymentHistory = [mockInvoices[1]];
mockCustomers[2].paymentHistory = [mockInvoices[2]];


export const mockTransactions: Transaction[] = [
  { id: '1', date: new Date().toISOString(), description: 'Pago de cliente por FAC-003', amount: 2500, type: 'income', category: 'Salario' },
  { id: '2', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Almuerzo con cliente', amount: 45.50, type: 'expense', category: 'Comida' },
  { id: '3', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Gasolina para coche de empresa', amount: 60.00, type: 'expense', category: 'Transporte' },
  { id: '4', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Factura de luz de la oficina', amount: 150.75, type: 'expense', category: 'Servicios' },
  { id: '5', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), description: 'Alquiler mensual de la oficina', amount: 2000, type: 'expense', category: 'Alquiler' },
  { id: '6', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), description: 'Depósito de salario', amount: 7000, type: 'income', category: 'Salario' },
  { id: '7', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), description: 'Sillas nuevas para la oficina', amount: 800, type: 'expense', category: 'Compras' },
];
