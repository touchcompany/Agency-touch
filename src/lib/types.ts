export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Comida' | 'Transporte' | 'Servicios' | 'Alquiler' | 'Entretenimiento' | 'Compras' | 'Viajes' | 'Salario' | 'Inversiones' | 'Otro';
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: 'paid' | 'pending' | 'overdue';
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentHistory: Invoice[];
};

export type UserSettings = {
  bankDetails: string;
  companyLogoUrl: string;
};
