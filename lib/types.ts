export type EstadoPago = "PAGADO" | "PENDIENTE DE VERIFICACIÓN" | "RECHAZADO" | string;
export type SiNo = "SÍ" | "NO" | string;
export type Rol = "Cliente" | "Bot" | "Vos" | string;
export type EventoTipo = string;

export interface Cliente {
  whatsapp: string;
  nombre: string;
  plan: string;
  monto: number;
  estadoPago: EstadoPago;
  fechaCompra: string;
  fechaActivacion: string;
  vencimiento: string;
  vigente: SiNo;
  referenciaPago: string;
  idMercadoPago: string;
  correo: string;
  contrasena: string;
  dni: string;
  enviarCuenta: string;
}

export interface HistorialMensaje { fecha: string; numero: string; rol: Rol; mensaje: string; }
export interface Cuenta { idCuenta: string; email: string; contrasena: string; perfiles: string[]; }
export interface CuentaCambiada { email: string; contrasena: string; pin: string; }
export interface Imagen { link: string; tipo: string; }
export interface VentaRevendedor {
  fechaVenta: string; revendedor: string; clienteFinal: string; plan: string; monto: number;
  correo: string; contrasena: string; activacion: string; vencimiento: string; perfiles: string;
  filaCuenta: string; estado: string; correoAnterior: string;
}
export interface Evento { fecha: string; hora: string; tipo: EventoTipo; numero: string; nombre: string; detalle: string; }
export interface Conocimiento { id: string; categoria: string; titulo: string; contenido: string; activo: SiNo; actualizado: string; }
export interface EstadoBot { ultimaActividad: string; }
export interface ClienteRevision { whatsapp: string; }
export interface CRMData {
  clientes: Cliente[]; historial: HistorialMensaje[]; cuentas: Cuenta[]; cuentasCambiadas: CuentaCambiada[];
  imagenes: Imagen[]; ventasRevendedor: VentaRevendedor[]; eventos: Evento[]; conocimiento: Conocimiento[];
  estadoBot: EstadoBot; enRevision: ClienteRevision[];
}
export interface DashboardStats { ingresosMes:number; clientesActivos:number; vencen3Dias:number; vencidos:number; pendientes:number; pagadosSinEntregar:number; tasaRenovacion:number; perfilesLibres:number; perfilesOcupados:number; }
