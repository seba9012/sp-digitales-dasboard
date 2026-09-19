import "server-only";
import { google } from "googleapis";
import { CRMData, Cliente, HistorialMensaje, Cuenta, CuentaCambiada, Imagen, VentaRevendedor, Evento, Conocimiento, EstadoBot, ClienteRevision, Configuracion, Comando } from "@/lib/types";

const ranges = {
  clientes: "Clientes!A:O",
  historial: "Historial completo!A:D",
  cuentas: "Cuentas!A:H",
  cambiadas: "Cuentas cambiadas!A:C",
  imagenes: "Imagenes!A:B",
  revendedores: "Ventas revendedor!A:M",
  revision: "En revisión!A:A",
} as const;

// Pestañas que crea/actualiza el propio bot (ver el bloque "PUENTE CON
// EL CRM" en index.js). Si todavía no existen (bot viejo sin
// actualizar), se leen como vacías en vez de romper todo el
// dashboard (batchGet falla completo si un rango no existe).
const optionalRanges = {
  eventos: "Eventos!A:F",
  conocimiento: "Conocimiento!A:F",
  estado: "Estado!A:B",
  configuracion: "Configuracion!A:B",
  comandos: "Comandos!A:E",
} as const;
type OptionalKey = keyof typeof optionalRanges;

const CONFIG_POR_DEFECTO: Configuracion = {
  precio1: 3500, precio2: 4200, precio3: 5000, precio4: 5800, descuentoReventa: 300,
};

function sheetsClient() {
  // Preferido: pegar el archivo .json de la cuenta de servicio completo
  // en GOOGLE_SERVICE_ACCOUNT_JSON. Evita todos los problemas de copiar
  // el email y la clave privada por separado (saltos de línea rotos,
  // comillas de más, etc.) — JSON.parse se encarga de interpretar los
  // \n correctamente.
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  let email: string | undefined;
  let privateKey: string | undefined;
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      email = parsed.client_email;
      privateKey = parsed.private_key;
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON no es un JSON válido.");
    }
  } else {
    // Alternativa (compatibilidad): variables separadas.
    email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }
  if (!email || !privateKey || !spreadsheetId) throw new Error("Faltan variables de Google Sheets.");
  const auth = new google.auth.JWT({ email, key: privateKey, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return { api: google.sheets({ version: "v4", auth }), spreadsheetId };
}
async function existingTabs(api: ReturnType<typeof sheetsClient>["api"], spreadsheetId: string) {
  try {
    const meta = await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties.title" });
    return new Set((meta.data.sheets ?? []).map(s => s.properties?.title ?? ""));
  } catch {
    return new Set<string>();
  }
}
const cell = (v: unknown) => String(v ?? "").trim();
const row = (r: unknown[], n: number) => Array.from({length:n},(_,i)=>cell(r[i]));

export async function readCRMFromSheets(): Promise<CRMData> {
  const {api, spreadsheetId}=sheetsClient();
  const tabs=await existingTabs(api, spreadsheetId);
  const optKeys=(Object.keys(optionalRanges) as OptionalKey[]).filter(k=>tabs.has(optionalRanges[k].split("!")[0]));
  const baseRanges=Object.values(ranges);
  const response=await api.spreadsheets.values.batchGet({spreadsheetId, ranges:[...baseRanges, ...optKeys.map(k=>optionalRanges[k])]});
  const vals=response.data.valueRanges ?? [];
  const get=(i:number)=>vals[i]?.values ?? [];
  const opt=(k:OptionalKey)=>{const i=optKeys.indexOf(k);return i<0?[]:get(baseRanges.length+i);};

  const clientes=get(0).slice(1).map(r=>{
    const [whatsapp,nombre,plan,monto,estadoPago,fechaCompra,fechaActivacion,vencimiento,vigente,referenciaPago,idMercadoPago,correo,contrasena,dni,enviarCuenta]=row(r,15);
    return {whatsapp,nombre,plan,monto:Number(String(monto).replace(/[^0-9.-]/g,""))||0,estadoPago,fechaCompra,fechaActivacion,vencimiento,vigente,referenciaPago,idMercadoPago,correo,contrasena,dni,enviarCuenta};
  }) as Cliente[];
  const historial=get(1).slice(1).map(r=>{const [fecha,numero,rol,mensaje]=row(r,4);return {fecha,numero,rol,mensaje};}) as HistorialMensaje[];
  const cuentas=get(2).slice(1).map(r=>{const [idCuenta,email,contrasena,p1,p2,p3,p4,p5]=row(r,8);return {idCuenta,email,contrasena,perfiles:[p1,p2,p3,p4,p5]};}) as Cuenta[];
  const cuentasCambiadas=get(3).slice(1).map(r=>{const [email,contrasena,pin]=row(r,3);return {email,contrasena,pin};}) as CuentaCambiada[];
  const imagenes=get(4).slice(1).map(r=>{const [link,tipo]=row(r,2);return {link,tipo};}) as Imagen[];
  const ventasRevendedor=get(5).slice(1).map(r=>{const [fechaVenta,revendedor,clienteFinal,plan,monto,correo,contrasena,activacion,vencimiento,perfiles,filaCuenta,estado,correoAnterior]=row(r,13);return {fechaVenta,revendedor,clienteFinal,plan,monto:Number(String(monto).replace(/[^0-9.-]/g,""))||0,correo,contrasena,activacion,vencimiento,perfiles,filaCuenta,estado,correoAnterior};}) as VentaRevendedor[];
  const enRevision=get(6).slice(1).filter(r=>cell(r[0])).map(r=>({whatsapp:cell(r[0])})) as ClienteRevision[];

  // Pestañas del bot (Eventos / Conocimiento / Estado / Configuracion / Comandos).
  // Vacías hasta que el bot las cree y escriba (bot viejo sin actualizar).
  const eventos=opt("eventos").slice(1).map(r=>{const [fecha,hora,tipo,numero,nombre,detalle]=row(r,6);return {fecha,hora,tipo,numero,nombre,detalle};}).filter(e=>e.fecha||e.tipo) as Evento[];
  const conocimiento=opt("conocimiento").slice(1).map((r,i)=>{const [id,categoria,titulo,contenido,activo,actualizado]=row(r,6);return {id:id||`fila-${i+2}`,categoria,titulo,contenido,activo:/^(s[ií]|true|1|x)$/i.test(activo)?"SÍ":"NO",actualizado};}).filter(k=>k.titulo||k.contenido) as Conocimiento[];
  const estadoBot: EstadoBot = { ultimaActividad: cell(opt("estado")[1]?.[0]) };

  const configFilas = opt("configuracion").slice(1);
  const configMapa: Record<string,string> = {};
  configFilas.forEach(r=>{ const [clave,valor]=row(r,2); if(clave) configMapa[clave]=valor; });
  const numeroOr = (clave: string, porDefecto: number) => {
    const n = Number(configMapa[clave]);
    return Number.isFinite(n) && n > 0 ? n : porDefecto;
  };
  const configuracion: Configuracion = {
    precio1: numeroOr("precio_1", CONFIG_POR_DEFECTO.precio1),
    precio2: numeroOr("precio_2", CONFIG_POR_DEFECTO.precio2),
    precio3: numeroOr("precio_3", CONFIG_POR_DEFECTO.precio3),
    precio4: numeroOr("precio_4", CONFIG_POR_DEFECTO.precio4),
    descuentoReventa: numeroOr("descuento_reventa", CONFIG_POR_DEFECTO.descuentoReventa),
  };

  const comandos = opt("comandos").slice(1).map((r,i)=>{
    const [id,tipo,estado,creado,resultado]=row(r,5);
    return {fila:i+2,id,tipo,estado,creado,resultado};
  }).filter(c=>c.id||c.tipo) as Comando[];

  return {clientes,historial,cuentas,cuentasCambiadas,imagenes,ventasRevendedor,eventos,conocimiento,estadoBot,enRevision,configuracion,comandos};
}

/* ==================================================
   ESCRITURA: CLIENTES
   El bot es dueño de la fila (whatsapp en columna A), así que para
   editar/borrar primero hay que encontrar el número de fila real.
================================================== */

async function filaDeCliente(api: ReturnType<typeof sheetsClient>["api"], spreadsheetId: string, whatsapp: string) {
  const resp = await api.spreadsheets.values.get({ spreadsheetId, range: "Clientes!A:A" });
  const columna = resp.data.values ?? [];
  const index = columna.findIndex((r,i) => i>0 && cell(r[0]) === whatsapp);
  return index < 0 ? null : index + 1; // +1 porque las filas de Sheets empiezan en 1
}

const ORDEN_COLUMNAS_CLIENTE: (keyof Cliente)[] = ["whatsapp","nombre","plan","monto","estadoPago","fechaCompra","fechaActivacion","vencimiento","vigente","referenciaPago","idMercadoPago","correo","contrasena","dni","enviarCuenta"];

export async function updateClienteEnSheets(whatsapp: string, patch: Partial<Cliente>): Promise<Cliente> {
  const {api, spreadsheetId} = sheetsClient();
  const fila = await filaDeCliente(api, spreadsheetId, whatsapp);
  if (!fila) throw new Error("Cliente no encontrado en la hoja.");

  const actual = await api.spreadsheets.values.get({ spreadsheetId, range: `Clientes!A${fila}:O${fila}` });
  const valoresActuales = row(actual.data.values?.[0] ?? [], 15);
  const clienteActual = Object.fromEntries(ORDEN_COLUMNAS_CLIENTE.map((k,i)=>[k,valoresActuales[i]])) as unknown as Cliente;
  const clienteNuevo: Cliente = { ...clienteActual, ...patch, monto: Number(patch.monto ?? clienteActual.monto) || 0 };

  const valores = ORDEN_COLUMNAS_CLIENTE.map(k => String(clienteNuevo[k] ?? ""));
  await api.spreadsheets.values.update({
    spreadsheetId, range: `Clientes!A${fila}:O${fila}`, valueInputOption: "USER_ENTERED",
    requestBody: { values: [valores] },
  });
  return clienteNuevo;
}

export async function createClienteEnSheets(cliente: Cliente): Promise<Cliente> {
  const {api, spreadsheetId} = sheetsClient();
  const existente = await filaDeCliente(api, spreadsheetId, cliente.whatsapp);
  if (existente) throw new Error("Ya existe un cliente con ese WhatsApp.");
  const valores = ORDEN_COLUMNAS_CLIENTE.map(k => String(cliente[k] ?? ""));
  await api.spreadsheets.values.append({
    spreadsheetId, range: "Clientes!A:O", valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
    requestBody: { values: [valores] },
  });
  return cliente;
}

export async function deleteClienteEnSheets(whatsapp: string): Promise<void> {
  const {api, spreadsheetId} = sheetsClient();
  const fila = await filaDeCliente(api, spreadsheetId, whatsapp);
  if (!fila) return;
  const meta = await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
  const hoja = meta.data.sheets?.find(s => s.properties?.title === "Clientes");
  const sheetId = hoja?.properties?.sheetId;
  if (sheetId === undefined) throw new Error('No se encontró la pestaña "Clientes".');
  await api.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: fila-1, endIndex: fila } } }] },
  });
}

/* ==================================================
   ESCRITURA: CONOCIMIENTO
================================================== */

const ORDEN_COLUMNAS_CONOCIMIENTO = ["id","categoria","titulo","contenido","activo","actualizado"] as const;

async function filaDeConocimiento(api: ReturnType<typeof sheetsClient>["api"], spreadsheetId: string, id: string) {
  const resp = await api.spreadsheets.values.get({ spreadsheetId, range: "Conocimiento!A:A" });
  const columna = resp.data.values ?? [];
  const index = columna.findIndex((r,i) => i>0 && cell(r[0]) === id);
  return index < 0 ? null : index + 1;
}

export async function createConocimientoEnSheets(item: Conocimiento): Promise<Conocimiento> {
  const {api, spreadsheetId} = sheetsClient();
  const id = item.id || `K-${Date.now()}`;
  const actualizado = new Date().toISOString().slice(0,10);
  const nuevo = { ...item, id, actualizado };
  const valores = ORDEN_COLUMNAS_CONOCIMIENTO.map(k => String(nuevo[k] ?? ""));
  await api.spreadsheets.values.append({
    spreadsheetId, range: "Conocimiento!A:F", valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
    requestBody: { values: [valores] },
  });
  return nuevo;
}

export async function updateConocimientoEnSheets(id: string, patch: Partial<Conocimiento>): Promise<Conocimiento> {
  const {api, spreadsheetId} = sheetsClient();
  const fila = await filaDeConocimiento(api, spreadsheetId, id);
  if (!fila) throw new Error("No se encontró ese ítem de conocimiento.");
  const actual = await api.spreadsheets.values.get({ spreadsheetId, range: `Conocimiento!A${fila}:F${fila}` });
  const valoresActuales = row(actual.data.values?.[0] ?? [], 6);
  const actualObj = Object.fromEntries(ORDEN_COLUMNAS_CONOCIMIENTO.map((k,i)=>[k,valoresActuales[i]])) as unknown as Conocimiento;
  const nuevo: Conocimiento = { ...actualObj, ...patch, id, actualizado: new Date().toISOString().slice(0,10) };
  const valores = ORDEN_COLUMNAS_CONOCIMIENTO.map(k => String(nuevo[k] ?? ""));
  await api.spreadsheets.values.update({
    spreadsheetId, range: `Conocimiento!A${fila}:F${fila}`, valueInputOption: "USER_ENTERED",
    requestBody: { values: [valores] },
  });
  return nuevo;
}

export async function deleteConocimientoEnSheets(id: string): Promise<void> {
  const {api, spreadsheetId} = sheetsClient();
  const fila = await filaDeConocimiento(api, spreadsheetId, id);
  if (!fila) return;
  const meta = await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
  const hoja = meta.data.sheets?.find(s => s.properties?.title === "Conocimiento");
  const sheetId = hoja?.properties?.sheetId;
  if (sheetId === undefined) return;
  await api.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: fila-1, endIndex: fila } } }] },
  });
}

/* ==================================================
   ESCRITURA: CONFIGURACIÓN (precios)
   El bot lee esta pestaña cada 1 minuto y actualiza sus precios en
   memoria solo con lo que cambió — no hace falta avisarle por otro
   lado.
================================================== */

export async function updateConfiguracionEnSheets(patch: Partial<Configuracion>): Promise<Configuracion> {
  const {api, spreadsheetId} = sheetsClient();
  const actual = await api.spreadsheets.values.get({ spreadsheetId, range: "Configuracion!A2:B6" });
  const filas = actual.data.values ?? [];
  const mapa: Record<string,string> = {};
  filas.forEach(f => { if (f[0]) mapa[cell(f[0])] = cell(f[1]); });

  const nueva: Configuracion = {
    precio1: patch.precio1 ?? Number(mapa["precio_1"]) ?? CONFIG_POR_DEFECTO.precio1,
    precio2: patch.precio2 ?? Number(mapa["precio_2"]) ?? CONFIG_POR_DEFECTO.precio2,
    precio3: patch.precio3 ?? Number(mapa["precio_3"]) ?? CONFIG_POR_DEFECTO.precio3,
    precio4: patch.precio4 ?? Number(mapa["precio_4"]) ?? CONFIG_POR_DEFECTO.precio4,
    descuentoReventa: patch.descuentoReventa ?? Number(mapa["descuento_reventa"]) ?? CONFIG_POR_DEFECTO.descuentoReventa,
  };

  await api.spreadsheets.values.update({
    spreadsheetId, range: "Configuracion!A2:B6", valueInputOption: "USER_ENTERED",
    requestBody: { values: [
      ["precio_1", String(nueva.precio1)],
      ["precio_2", String(nueva.precio2)],
      ["precio_3", String(nueva.precio3)],
      ["precio_4", String(nueva.precio4)],
      ["descuento_reventa", String(nueva.descuentoReventa)],
    ] },
  });

  return nueva;
}

/* ==================================================
   ESCRITURA: COMANDOS
   El CRM solo agrega la fila con estado PENDIENTE; el bot (corriendo
   en la PC/servidor real) la ve, la ejecuta, y escribe el resultado.
================================================== */

export async function crearComandoEnSheets(tipo: string): Promise<Comando> {
  const {api, spreadsheetId} = sheetsClient();
  const id = `C-${Date.now()}`;
  const creado = new Date().toISOString();
  await api.spreadsheets.values.append({
    spreadsheetId, range: "Comandos!A:E", valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[id, tipo, "PENDIENTE", creado, ""]] },
  });
  return { fila: -1, id, tipo, estado: "PENDIENTE", creado, resultado: "" };
}
