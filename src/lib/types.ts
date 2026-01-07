'use client';
export type User = {
  id: string;
  email?: string;
  phoneNumber?: string;
  providerId?: string;
  role?: 'superuser' | 'collaborator';
  displayName?: string;
};

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
  companyProfileId?: string;
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
  isMonthly?: boolean;
  invoiceDay?: number;
  defaultServiceId?: string;
};

export type Collaborator = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  isMonthly?: boolean;
  paymentDay?: number;
  defaultPaymentAmount?: number;
  defaultPaymentDescription?: string;
  defaultPaymentCategory?: string;
};


export type DetalleCuenta = {
  id?: string;
  descripcion: string;
  cantidad: number;
  precio: number;
};

export type CompanyProfile = {
    id: string;
    userId: string;
    profileName: string;
    companyName: string;
    companyNit: string;
    companyWhatsapp: string;
    paymentDetails: string;
    logoUrl?: string;
    companyAddress?: string;
    companyEmail?: string;
}

export type Project = {
    id: string;
    userId: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    customerId?: string;
    collaboratorId?: string;
    dueDate?: string;
    script?: string;
    songUrl?: string;
    projectUrl?: string;
    publishTime?: string;
}

export type ScriptTemplate = {
  id: string;
  userId: string;
  title: string;
  content: string;
}


// Deprecated, use CompanyProfile instead
export type CompanySettings = {
    id: 'company';
    companyName: string;
    companyNit: string;
    companyWhatsapp: string;
    paymentDetails: string;
    logoUrl?: string;
}

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
d-spacing: 0.12rem;
  letter-spacing: 0.12rem;
}
.k-color-accent {
  color: hsl(var(--accent-foreground));
}
.k-color-accent--contrasted {
  color: hsl(var(--accent));
}
.k-bg-accent {
  background-color: hsl(var(--accent));
}
.k-bg-accent--contrasted {
  background-color: hsl(var(--accent-foreground));
}
.k-border-accent {
  border-color: hsl(var(--accent));
}
.k-color-destructive {
  color: hsl(var(--destructive-foreground));
}
.k-color-destructive--contrasted {
  color: hsl(var(--destructive));
}
.k-bg-destructive {
  background-color: hsl(var(--destructive));
}
.k-bg-destructive--contrasted {
  background-color: hsl(var(--destructive-foreground));
}
.k-border-destructive {
  border-color: hsl(var(--destructive));
}
.k-color-secondary {
  color: hsl(var(--secondary-foreground));
}
.k-color-secondary--contrasted {
  color: hsl(var(--secondary));
}
.k-bg-secondary {
  background-color: hsl(var(--secondary));
}
.k-bg-secondary--contrasted {
  background-color: hsl(var(--secondary-foreground));
}
.k-border-secondary {
  border-color: hsl(var(--secondary));
}
.k-color-muted {
  color: hsl(var(--muted-foreground));
}
.k-color-muted--contrasted {
  color: hsl(var(--muted));
}
.k-bg-muted {
  background-color: hsl(var(--muted));
}
.k-bg-muted--contrasted {
  background-color: hsl(var(--muted-foreground));
}
.k-border-muted {
  border-color: hsl(var(--muted));
}
.k-color-popover {
  color: hsl(var(--popover-foreground));
}
.k-color-popover--contrasted {
  color: hsl(var(--popover));
}
.k-bg-popover {
  background-color: hsl(var(--popover));
}
.k-bg-popover--contrasted {
  background-color: hsl(var(--popover-foreground));
}
.k-border-popover {
  border-color: hsl(var(--popover));
}
.k-color-card {
  color: hsl(var(--card-foreground));
}
.k-color-card--contrasted {
  color: hsl(var(--card));
}
.k-bg-card {
  background-color: hsl(var(--card));
}
.k-bg-card--contrasted {
  background-color: hsl(var(--card-foreground));
}
.k-border-card {
  border-color: hsl(var(--card));
}
.k-color-background {
  color: hsl(var(--foreground));
}
.k-color-background--contrasted {
  color: hsl(var(--background));
}
.k-bg-background {
  background-color: hsl(var(--background));
}
.k-bg-background--contrasted {
  background-color: hsl(var(--foreground));
}
.k-border-background {
  border-color: hsl(var(--foreground));
}
.k-color-foreground {
  color: hsl(var(--background));
}
.k-color-foreground--contrasted {
  color: hsl(var(--foreground));
}
.k-bg-foreground {
  background-color: hsl(var(--foreground));
}
.k-bg-foreground--contrasted {
  background-color: hsl(var(--background));
}
.k-border-foreground {
  border-color: hsl(var(--background));
}
.k-color-border {
  color: hsl(var(--border));
}
.k-color-ring {
  color: hsl(var(--ring));
}
.k-color-input {
  color: hsl(var(--input));
}
.k-font-sans {
  font-family: var(--font-sans);
}
.k-font-mono {
  font-family: var(--font-mono);
}
.k-font-display {
  font-family: var(--font-display);
}
.k-rounded {
  border-radius: var(--radius);
}
.k-rounded-sm {
  border-radius: calc(var(--radius) - 4px);
}
.k-rounded-md {
  border-radius: calc(var(--radius) - 2px);
}
.k-rounded-lg {
  border-radius: var(--radius);
}
.k-rounded-xl {
  border-radius: calc(var(--radius) + 4px);
}
.k-rounded-2xl {
  border-radius: calc(var(--radius) + 8px);
}
.k-rounded-3xl {
  border-radius: calc(var(--radius) + 16px);
}
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

    

    