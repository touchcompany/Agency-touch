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

// This is a placeholder type for the original Customer type from the starter project
// It's used in customers-table.tsx to calculate total spent.
// We will replace this with the new data model soon.
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  paymentHistory: {
    status: 'paid' | 'pending' | 'overdue';
    items: {
      price: number;
      quantity: number;
    }[];
  }[];
};
