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

function sheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !privateKey || !spreadsheetId) throw new Error("Faltan variables de Google Sheets.");
  const auth = new google.auth.JWT({ email, key: privateKey, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return { api: google.sheets({ version: "v4", auth }), spreadsheetId };
}
const cell = (v: unknown) => String(v ?? "").trim();
const row = (r: unknown[], n: number) => Array.from({length:n},(_,i)=>cell(r[i]));

export async function readCRMFromSheets(): Promise<CRMData> {
  const {api, spreadsheetId}=sheetsClient();
  const response=await api.spreadsheets.values.batchGet({spreadsheetId, ranges:Object.values(ranges)});
  const vals=response.data.valueRanges ?? [];
  const get=(i:number)=>vals[i]?.values ?? [];

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

  // The supplied workbook currently has no NUEVAS/Evento/Conocimiento/Estado tab.
  // Keep these collections empty so the dashboard remains compatible with the future bot bridge.
  const estadoBot: EstadoBot = { ultimaActividad: "" };
  const eventos: Evento[] = [];
  const conocimiento: Conocimiento[] = [];
  return {clientes,historial,cuentas,cuentasCambiadas,imagenes,ventasRevendedor,eventos,conocimiento,estadoBot,enRevision};
}
