import { CRMData } from "@/lib/types";

const today = new Date();
const iso = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};
const arDate = (offset: number) => iso(offset).slice(0,10);

export const mockData: CRMData = {
  imagenes: [],
  enRevision: [],
  clientes: [
    {
      whatsapp: "5491160010001", nombre: "Lucía Fernández", plan: "Netflix Crack 2", monto: 4200,
      estadoPago: "PAGADO", fechaCompra: arDate(-4), fechaActivacion: arDate(-4), vencimiento: arDate(2),
      vigente: "SÍ", referenciaPago: "MP-10001", idMercadoPago: "12345001", correo: "lucia@example.com", contrasena: "NetflixDemo01", dni: "30111222", enviarCuenta: "SÍ"
    },
    {
      whatsapp: "5491160010002", nombre: "Marcos Sosa", plan: "Disney+ Crack 1", monto: 3000,
      estadoPago: "PENDIENTE DE VERIFICACIÓN", fechaCompra: arDate(-1), fechaActivacion: "", vencimiento: arDate(29),
      vigente: "NO", referenciaPago: "MP-10002", idMercadoPago: "12345002", correo: "marcos@example.com", contrasena: "DisneyDemo02", dni: "32222333", enviarCuenta: "SÍ"
    },
    {
      whatsapp: "5491160010003", nombre: "Carolina Pérez", plan: "Netflix Crack 4", monto: 5800,
      estadoPago: "PAGADO", fechaCompra: arDate(-31), fechaActivacion: arDate(-30), vencimiento: arDate(-1),
      vigente: "NO", referenciaPago: "MP-10003", idMercadoPago: "12345003", correo: "caro@example.com", contrasena: "NetflixDemo03", dni: "29444555", enviarCuenta: "SÍ"
    },
    {
      whatsapp: "5491160010004", nombre: "Diego Acosta", plan: "Netflix Crack 1", monto: 3500,
      estadoPago: "PAGADO", fechaCompra: arDate(-2), fechaActivacion: "", vencimiento: arDate(28),
      vigente: "NO", referenciaPago: "MP-10004", idMercadoPago: "12345004", correo: "diego@example.com", contrasena: "NetflixDemo04", dni: "27666777", enviarCuenta: "SÍ"
    },
    {
      whatsapp: "5491160010005", nombre: "Sofía Molina", plan: "Disney+ Crack 3", monto: 3800,
      estadoPago: "RECHAZADO", fechaCompra: arDate(-2), fechaActivacion: "", vencimiento: arDate(28),
      vigente: "NO", referenciaPago: "MP-10005", idMercadoPago: "12345005", correo: "sofia@example.com", contrasena: "DisneyDemo05", dni: "31888999", enviarCuenta: "SÍ"
    },
    {
      whatsapp: "5491160010006", nombre: "Nicolás Gómez", plan: "Netflix Crack 3", monto: 5000,
      estadoPago: "PAGADO", fechaCompra: arDate(-12), fechaActivacion: arDate(-12), vencimiento: arDate(18),
      vigente: "SÍ", referenciaPago: "MP-10006", idMercadoPago: "12345006", correo: "nico@example.com", contrasena: "NetflixDemo06", dni: "28777111", enviarCuenta: "SÍ"
    }
  ],
  historial: [
    { fecha: iso(-2), numero: "5491160010004", rol: "Cliente", mensaje: "Hola, quiero contratar Netflix." },
    { fecha: iso(-2), numero: "5491160010004", rol: "Bot", mensaje: "¡Hola! Te ayudo con los planes disponibles." },
    { fecha: iso(-2), numero: "5491160010004", rol: "Cliente", mensaje: "Quiero Crack 1." },
    { fecha: iso(-2), numero: "5491160010004", rol: "Bot", mensaje: "El plan seleccionado tiene un valor de $3.500." },
    { fecha: iso(-2), numero: "5491160010004", rol: "Cliente", mensaje: "Listo, ya pagué." },
    { fecha: iso(-2), numero: "5491160010004", rol: "Bot", mensaje: "Perfecto. Enviame el comprobante." },
    { fecha: iso(-1), numero: "5491160010002", rol: "Cliente", mensaje: "¿Puedo renovar Disney?" },
    { fecha: iso(-1), numero: "5491160010002", rol: "Bot", mensaje: "Sí. Decime el plan que querés renovar." },
    { fecha: iso(-1), numero: "5491160010002", rol: "Vos", mensaje: "Derivo la conversación para verificar el pago." }
  ],
  cuentas: [
    { idCuenta: "NFX-001", email: "cuenta1@example.com", contrasena: "DemoPass01", perfiles: ["Ocupado","Ocupado","libre","libre","libre"] },
    { idCuenta: "NFX-002", email: "cuenta2@example.com", contrasena: "DemoPass02", perfiles: ["Ocupado","Ocupado","Ocupado","libre","libre"] },
    { idCuenta: "DIS-001", email: "cuenta3@example.com", contrasena: "DemoPass03", perfiles: ["Ocupado","libre","libre","libre","libre"] }
  ],
  cuentasCambiadas: [
    { email: "anterior@example.com", contrasena: "OldDemo01", pin: "1234" }
  ],
  ventasRevendedor: [
    { fechaVenta: arDate(-4), revendedor: "Revendedor Norte", clienteFinal: "Lucía Fernández", plan: "Netflix Crack 2", monto: 5200, correo: "lucia@example.com", contrasena: "NetflixDemo01", activacion: arDate(-4), vencimiento: arDate(2), perfiles: "2", estado: "ACTIVA" },
    { fechaVenta: arDate(-12), revendedor: "Revendedor Centro", clienteFinal: "Nicolás Gómez", plan: "Netflix Crack 3", monto: 6200, correo: "nico@example.com", contrasena: "NetflixDemo06", activacion: arDate(-12), vencimiento: arDate(18), perfiles: "3", estado: "ACTIVA" },
    { fechaVenta: arDate(-31), revendedor: "Revendedor Norte", clienteFinal: "Carolina Pérez", plan: "Netflix Crack 4", monto: 7000, correo: "caro@example.com", contrasena: "NetflixDemo03", activacion: arDate(-30), vencimiento: arDate(-1), perfiles: "4", estado: "VENCIDA" }
  ],
  eventos: [
    { fecha: arDate(-1), hora: "09:12", tipo: "COMPROBANTE", numero: "5491160010004", nombre: "Diego Acosta", detalle: "Comprobante recibido" },
    { fecha: arDate(-1), hora: "09:15", tipo: "ENTREGA_COMPRA", numero: "5491160010001", nombre: "Lucía Fernández", detalle: "Cuenta entregada" },
    { fecha: arDate(-1), hora: "10:42", tipo: "RENOVACION", numero: "5491160010006", nombre: "Nicolás Gómez", detalle: "Renovación detectada" },
    { fecha: arDate(-1), hora: "11:03", tipo: "DERIVADO", numero: "5491160010002", nombre: "Marcos Sosa", detalle: "Derivado para verificación" },
    { fecha: arDate(-1), hora: "12:18", tipo: "INCIDENCIA_RESUELTA", numero: "5491160010003", nombre: "Carolina Pérez", detalle: "Incidencia resuelta" },
    { fecha: arDate(-2), hora: "20:30", tipo: "SIN_DISPONIBILIDAD", numero: "5491160099999", nombre: "Consulta", detalle: "Sin stock disponible" }
  ],
  conocimiento: [
    { id: "K-001", categoria: "precios", titulo: "Precios Netflix", contenido: "Crack 1: $3500; Crack 2: $4200; Crack 3: $5000; Crack 4: $5800.", activo: "SÍ", actualizado: arDate(-1) },
    { id: "K-002", categoria: "precios", titulo: "Precios Disney+", contenido: "Crack 1: $3000; Crack 2: $3400; Crack 3: $3800; Crack 4: $4200.", activo: "SÍ", actualizado: arDate(-1) },
    { id: "K-003", categoria: "políticas", titulo: "Garantía", contenido: "Si una cuenta presenta un problema, se gestiona el cambio o la reposición de días según disponibilidad.", activo: "SÍ", actualizado: arDate(-2) },
    { id: "K-004", categoria: "problemas frecuentes", titulo: "No puede ingresar", contenido: "Solicitar captura y derivar si no se resuelve con las instrucciones disponibles.", activo: "SÍ", actualizado: arDate(-3) }
  ],
  estadoBot: { ultimaActividad: new Date(Date.now() - 45_000).toISOString() }
};
