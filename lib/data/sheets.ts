import "server-only";
import { google } from "googleapis";
import { CRMData, Cliente, HistorialMensaje, Cuenta, CuentaCambiada, Imagen, VentaRevendedor, Evento, Conocimiento, EstadoBot, ClienteRevision } from "@/lib/types";

const ranges = {
  clientes: "Clientes!A:O",
  historial: "Historial completo!A:D",
  cuentas: "Cuentas!A:H",
  cambiadas: "Cuentas cambiadas!A:C",
  imagenes: "Imagenes!A:B",
  revendedores: "Ventas revendedor!A:M",
  revision: "En revisión!A:A",
} as const;

// Pestañas que crea/actualiza el bot (ver bot/crm-bridge.js). Si todavía no existen, se leen como vacías
// en vez de romper todo el dashboard (batchGet falla completo si un rango no existe).
const optionalRanges = {
  eventos: "Eventos!A:F",
  conocimiento: "Conocimiento!A:F",
  estado: "Estado!A:B",
} as const;
type OptionalKey = keyof typeof optionalRanges;

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
  const ventasRevendedor=get(5).slice(1).map((r,i)=>{const [fechaVenta,revendedor,clienteFinal,plan,monto,correo,contrasena,activacion,vencimiento,perfiles,filaCuenta,estado,correoAnterior]=row(r,13);return {fechaVenta,revendedor,clienteFinal,plan,monto:Number(String(monto).replace(/[^0-9.-]/g,""))||0,correo,contrasena,activacion,vencimiento,perfiles,filaCuenta,estado,correoAnterior,filaVenta:i+2};}) as VentaRevendedor[];
  const enRevision=get(6).slice(1).filter(r=>cell(r[0])).map(r=>({whatsapp:cell(r[0])})) as ClienteRevision[];

  // Pestañas del bot (Eventos / Conocimiento / Estado). Vacías hasta que el bot las cree y escriba.
  const eventos=opt("eventos").slice(1).map(r=>{const [fecha,hora,tipo,numero,nombre,detalle]=row(r,6);return {fecha,hora,tipo,numero,nombre,detalle};}).filter(e=>e.fecha||e.tipo) as Evento[];
  const conocimiento=opt("conocimiento").slice(1).map((r,i)=>{const [id,categoria,titulo,contenido,activo,actualizado]=row(r,6);return {id:id||`fila-${i+2}`,categoria,titulo,contenido,activo:/^(s[ií]|true|1|x)$/i.test(activo)?"SÍ":"NO",actualizado};}).filter(k=>k.titulo||k.contenido) as Conocimiento[];
  const estadoBot: EstadoBot = { ultimaActividad: cell(opt("estado")[1]?.[0]) };
  return {clientes,historial,cuentas,cuentasCambiadas,imagenes,ventasRevendedor,eventos,conocimiento,estadoBot,enRevision};
}

// ---------------------------------------------------------------------------
// Escritura: alta / edición / baja de clientes directo sobre la hoja "Clientes".
// El bot y el CRM leen y escriben la misma pestaña, así que esto es exactamente
// lo mismo que hace el bot cuando confirma un pago o activa una cuenta.
// ---------------------------------------------------------------------------

const CLIENTE_COLUMNAS: (keyof Cliente)[] = [
  "whatsapp", "nombre", "plan", "monto", "estadoPago", "fechaCompra", "fechaActivacion",
  "vencimiento", "vigente", "referenciaPago", "idMercadoPago", "correo", "contrasena", "dni", "enviarCuenta",
];

function clienteToRow(c: Cliente): (string | number)[] {
  return CLIENTE_COLUMNAS.map(k => (c[k] ?? "") as string | number);
}

/** Fila (1-based, incluyendo encabezado) de un cliente por WhatsApp, o null si no existe. */
async function findClienteRow(api: ReturnType<typeof sheetsClient>["api"], spreadsheetId: string, whatsapp: string): Promise<number | null> {
  const res = await api.spreadsheets.values.get({ spreadsheetId, range: "Clientes!A:A" });
  const col = res.data.values ?? [];
  const target = cell(whatsapp);
  for (let i = 1; i < col.length; i++) {
    if (cell(col[i]?.[0]) === target) return i + 1;
  }
  return null;
}

async function sheetIdFor(api: ReturnType<typeof sheetsClient>["api"], spreadsheetId: string, title: string): Promise<number> {
  const meta = await api.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
  const sheet = (meta.data.sheets ?? []).find(s => s.properties?.title === title);
  if (sheet?.properties?.sheetId == null) throw new Error(`No encontré la pestaña "${title}" en la planilla.`);
  return sheet.properties.sheetId;
}

export async function createClienteEnSheets(cliente: Cliente): Promise<Cliente> {
  const { api, spreadsheetId } = sheetsClient();
  const existente = await findClienteRow(api, spreadsheetId, cliente.whatsapp);
  if (existente) throw new Error("Ya existe un cliente con ese WhatsApp.");
  await api.spreadsheets.values.append({
    spreadsheetId,
    range: "Clientes!A:O",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [clienteToRow(cliente)] },
  });
  return cliente;
}

export async function updateClienteEnSheets(whatsapp: string, patch: Partial<Cliente>): Promise<Cliente> {
  const { api, spreadsheetId } = sheetsClient();
  const fila = await findClienteRow(api, spreadsheetId, whatsapp);
  if (!fila) throw new Error("Cliente no encontrado.");
  const actualRes = await api.spreadsheets.values.get({ spreadsheetId, range: `Clientes!A${fila}:O${fila}` });
  const actualRow = row(actualRes.data.values?.[0] ?? [], 15);
  const actual = Object.fromEntries(CLIENTE_COLUMNAS.map((k, i) => [k, actualRow[i]])) as unknown as Cliente;
  const merged: Cliente = { ...actual, ...patch, whatsapp: actual.whatsapp };
  await api.spreadsheets.values.update({
    spreadsheetId,
    range: `Clientes!A${fila}:O${fila}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [clienteToRow(merged)] },
  });
  return merged;
}

export async function deleteClienteEnSheets(whatsapp: string): Promise<void> {
  const { api, spreadsheetId } = sheetsClient();
  const fila = await findClienteRow(api, spreadsheetId, whatsapp);
  if (!fila) return;
  const sheetId = await sheetIdFor(api, spreadsheetId, "Clientes");
  await api.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: fila - 1, endIndex: fila } } }] },
  });
}

// ---------------------------------------------------------------------------
// Escritura: alta / edición / baja de ventas de revendedor (con su cliente final)
// sobre la hoja "Ventas revendedor". Acá no hay una columna con ID único, así
// que se opera directo por número de fila (calculado al leer, ver filaVenta).
// ---------------------------------------------------------------------------

const VENTA_COLUMNAS: (keyof VentaRevendedor)[] = [
  "fechaVenta", "revendedor", "clienteFinal", "plan", "monto", "correo", "contrasena",
  "activacion", "vencimiento", "perfiles", "filaCuenta", "estado", "correoAnterior",
];

function ventaToRow(v: VentaRevendedor): (string | number)[] {
  return VENTA_COLUMNAS.map(k => (v[k] ?? "") as string | number);
}

export async function createVentaEnSheets(venta: VentaRevendedor): Promise<VentaRevendedor> {
  const { api, spreadsheetId } = sheetsClient();
  await api.spreadsheets.values.append({
    spreadsheetId,
    range: "Ventas revendedor!A:M",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [ventaToRow(venta)] },
  });
  return venta;
}

export async function updateVentaEnSheets(fila: number, patch: Partial<VentaRevendedor>): Promise<VentaRevendedor> {
  const { api, spreadsheetId } = sheetsClient();
  const actualRes = await api.spreadsheets.values.get({ spreadsheetId, range: `Ventas revendedor!A${fila}:M${fila}` });
  const actualRow = row(actualRes.data.values?.[0] ?? [], 13);
  if (!actualRow.some(Boolean)) throw new Error("Venta no encontrada (¿cambió el orden de filas en la hoja?).");
  const actual = Object.fromEntries(VENTA_COLUMNAS.map((k, i) => [k, actualRow[i]])) as unknown as VentaRevendedor;
  const merged: VentaRevendedor = { ...actual, ...patch, filaVenta: fila };
  await api.spreadsheets.values.update({
    spreadsheetId,
    range: `Ventas revendedor!A${fila}:M${fila}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [ventaToRow(merged)] },
  });
  return merged;
}

export async function deleteVentaEnSheets(fila: number): Promise<void> {
  const { api, spreadsheetId } = sheetsClient();
  const sheetId = await sheetIdFor(api, spreadsheetId, "Ventas revendedor");
  await api.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: fila - 1, endIndex: fila } } }] },
  });
}
