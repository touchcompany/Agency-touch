import type { Transaction, Customer, Invoice } from './types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com',
    phone: '555-0101',
    address: '123 Innovation Drive, Silicon Valley, CA',
    paymentHistory: [],
  },
  {
    id: '2',
    name: 'Creative Designs Co.',
    email: 'hello@creativedesigns.co',
    phone: '555-0102',
    address: '456 Artistry Avenue, New York, NY',
    paymentHistory: [],
  },
  {
    id: '3',
    name: 'Global Exports Ltd.',
    email: 'sales@globalexports.com',
    phone: '555-0103',
    address: '789 Commerce Street, London, UK',
    paymentHistory: [],
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-001',
    customer: mockCustomers[0],
    issueDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    items: [
      { id: '1', description: 'Website Development', quantity: 1, price: 5000 },
      { id: '2', description: 'Monthly Hosting', quantity: 1, price: 100 },
    ],
    status: 'pending',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-002',
    customer: mockCustomers[1],
    issueDate: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    items: [{ id: '1', description: 'Logo Design', quantity: 1, price: 1200 }],
    status: 'overdue',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-003',
    customer: mockCustomers[2],
    issueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    items: [{ id: '1', description: 'Consulting Services', quantity: 10, price: 250 }],
    status: 'paid',
  },
];

mockCustomers[0].paymentHistory = [mockInvoices[0]];
mockCustomers[1].paymentHistory = [mockInvoices[1]];
mockCustomers[2].paymentHistory = [mockInvoices[2]];


export const mockTransactions: Transaction[] = [
  { id: '1', date: new Date().toISOString(), description: 'Client payment for INV-003', amount: 2500, type: 'income', category: 'Salary' },
  { id: '2', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Lunch meeting with client', amount: 45.50, type: 'expense', category: 'Food' },
  { id: '3', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Gas for company car', amount: 60.00, type: 'expense', category: 'Transportation' },
  { id: '4', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Office electricity bill', amount: 150.75, type: 'expense', category: 'Utilities' },
  { id: '5', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), description: 'Monthly Office Rent', amount: 2000, type: 'expense', category: 'Rent' },
  { id: '6', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), description: 'Salary Deposit', amount: 7000, type: 'income', category: 'Salary' },
  { id: '7', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), description: 'New office chairs', amount: 800, type: 'expense', category: 'Shopping' },
];
