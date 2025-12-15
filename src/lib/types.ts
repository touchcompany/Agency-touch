

export type Service = {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
};

export type Income = {
  id: string;
  userId: string;
  customerId?: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  invoiceId?: string;
};

export type Expense = {
  id: string;
  userId: string;
  collaboratorId?: string;
  date: string;
  amount: number;
  description: string;
  category: string;
};

export type Invoice = {
  id: string;
  userId: string;
  customerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amountDue: number;
  status: 'sent' | 'paid' | 'overdue';
  bankDetails?: string;
  detalle?: DetalleCuenta[];
  descripcion?: string;
};

export type Customer = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  nit?: string;
  logoUrl?: string;
};

export type Collaborator = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
};


export type DetalleCuenta = {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
};

export type Cuenta = {
  id: string;
  numeroCuenta: string;
  clienteId: string;
  descripcion: string;
  detalle: DetalleCuenta[];
  valorTotal: number;
  fechaEmision: string;
  fechaVencimiento?: string;
  observaciones?: string;
  firmaUrl?: string;
  datosEmpresa: {
    nombreEmpresa: string;
    nitEmpresa: string;
    direccion: string;
    datosBanco: string;
  };
  esGeneradaAutomaticamente: boolean;
  periodo?: string;
  estadoEnvio: {
    enviada: boolean;
    via: 'whatsapp' | 'email' | 'ninguno';
    fechaEnvio?: string;
  };
  status: 'pagada' | 'pendiente' | 'vencida';
};

export type Cliente = {
  id: string;
  nombre: string;
  nid: string;
  whatsapp: string;
  email: string;
  esMensual: boolean;
  logoUrl?: string;
  activo: boolean;
  fechaCreacion: string;
  notas?: string;
  historialCuentas: Cuenta[];
};

export type Pago = {
  id: string;
  clienteId: string;
  cuentaId?: string;
  monto: number;
  fechaPago: string;
  descripcion: string;
  metodoPago: 'efectivo' | 'transferencia' | 'otro';
  creadoPorIA: boolean;
  notas?: string;
};

export type ConfiguracionEmpresa = {
  nombreEmpresa: string;
  nitEmpresa: string;
  direccion: string;
  telefono: string;
  email: string;
  datosBanco: string;
};

export type AjustesEnvio = {
  enviarPorWhatsApp: boolean;
  enviarPorEmail: boolean;
  diaEnvioMensual: number;
};

export type Configuracion = {
  id: 'main';
  datosEmpresa: ConfiguracionEmpresa;
  ajustesEnvio: AjustesEnvio;
};
