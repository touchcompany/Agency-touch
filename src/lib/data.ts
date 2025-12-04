import type { Pago, Cliente, Cuenta } from './types';

export const mockClientes: Cliente[] = [
  {
    id: '1',
    nombre: 'Soluciones Tecnológicas Inc.',
    nid: '900.123.456-7',
    whatsapp: '+15550101',
    email: 'contacto@solucionestec.com',
    esMensual: true,
    activo: true,
    fechaCreacion: new Date().toISOString(),
    historialCuentas: [],
    logoUrl: `https://picsum.photos/seed/1/100/100`,
  },
  {
    id: '2',
    nombre: 'Diseños Creativos Co.',
    nid: '800.987.654-3',
    whatsapp: '+15550102',
    email: 'hola@disenoscreativos.co',
    esMensual: false,
    activo: true,
    fechaCreacion: new Date().toISOString(),
    historialCuentas: [],
    logoUrl: `https://picsum.photos/seed/2/100/100`,
  },
  {
    id: '3',
    nombre: 'Exportaciones Globales Ltd.',
    nid: '700.555.888-1',
    whatsapp: '+445550103',
    email: 'ventas@exportacionesglobales.com',
    esMensual: true,
    activo: false,
    fechaCreacion: new Date().toISOString(),
    historialCuentas: [],
    logoUrl: `https://picsum.photos/seed/3/100/100`,
  },
];

export const mockCuentas: Cuenta[] = [
  {
    id: 'CTA-001',
    numeroCuenta: '100',
    clienteId: mockClientes[0].id,
    descripcion: 'Servicio de desarrollo de software - Enero',
    detalle: [
      { id: '1', descripcion: 'Desarrollo de Sitio Web', cantidad: 1, precio: 5000 },
      { id: '2', descripcion: 'Hosting Mensual', cantidad: 1, precio: 100 },
    ],
    valorTotal: 5100,
    fechaEmision: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    fechaVencimiento: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    status: 'pendiente',
    datosEmpresa: {
        nombreEmpresa: "Mi Empresa SAS",
        nitEmpresa: "123.456.789-0",
        direccion: "Calle Falsa 123",
        datosBanco: "Bancolombia Ahorros 123-456789-00"
    },
    esGeneradaAutomaticamente: false,
    estadoEnvio: { enviada: false, via: 'ninguno'}
  },
  {
    id: 'CTA-002',
    numeroCuenta: '101',
    clienteId: mockClientes[1].id,
    descripcion: 'Diseño de identidad de marca',
    detalle: [{ id: '1', descripcion: 'Diseño de Logo', cantidad: 1, precio: 1200 }],
    valorTotal: 1200,
    fechaEmision: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString(),
    fechaVencimiento: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    status: 'vencida',
    datosEmpresa: {
        nombreEmpresa: "Mi Empresa SAS",
        nitEmpresa: "123.456.789-0",
        direccion: "Calle Falsa 123",
        datosBanco: "Bancolombia Ahorros 123-456789-00"
    },
    esGeneradaAutomaticamente: false,
    estadoEnvio: { enviada: true, via: 'email', fechaEnvio: new Date(new Date().setDate(new Date().getDate() - 40)).toISOString()}
  },
  {
    id: 'CTA-003',
    numeroCuenta: '102',
    clienteId: mockClientes[2].id,
    descripcion: 'Consultoría de exportación',
    detalle: [{ id: '1', descripcion: 'Servicios de Consultoría', cantidad: 10, precio: 250 }],
    valorTotal: 2500,
    fechaEmision: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    fechaVencimiento: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    status: 'pagada',
    datosEmpresa: {
        nombreEmpresa: "Mi Empresa SAS",
        nitEmpresa: "123.456.789-0",
        direccion: "Calle Falsa 123",
        datosBanco: "Bancolombia Ahorros 123-456789-00"
    },
    esGeneradaAutomaticamente: false,
    estadoEnvio: { enviada: true, via: 'whatsapp', fechaEnvio: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()}
  },
];

mockClientes[0].historialCuentas = [mockCuentas[0]];
mockClientes[1].historialCuentas = [mockCuentas[1]];
mockClientes[2].historialCuentas = [mockCuentas[2]];


export const mockPagos: Pago[] = [
  { id: '1', fechaPago: new Date().toISOString(), descripcion: 'Pago de cliente por CTA-003', monto: 2500, metodoPago: 'transferencia', creadoPorIA: false, clienteId: '3', cuentaId: 'CTA-003' },
  { id: '2', fechaPago: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), descripcion: 'Adelanto por proyecto de diseño', monto: 600, metodoPago: 'transferencia', creadoPorIA: false, clienteId: '2' },
  { id: '3', fechaPago: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), descripcion: 'Abono cliente Soluciones Tec.', monto: 1000, metodoPago: 'efectivo', creadoPorIA: false, clienteId: '1' },
];
