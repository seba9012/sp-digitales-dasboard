export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

const TZ = "America/Argentina/Buenos_Aires";

/** Acepta "dd/mm/aaaa" (formato que escribe el bot) o "aaaa-mm-dd" / ISO. Devuelve "aaaa-mm-dd" o null. */
export function isoDate(value: string): string | null {
  const s = String(value ?? "").trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/** Fecha de hoy en Argentina, "aaaa-mm-dd" (el servidor de Vercel corre en UTC). */
export function hoyAR(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date());
}

const dayNumber = (iso: string) =>
  Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / 86400000;

export function dateAR(value: string) {
  const d = isoDate(value);
  if (!d) return value;
  return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
}

export function daysUntil(date: string) {
  const d = isoDate(date);
  if (!d) return NaN;
  return dayNumber(d) - dayNumber(hoyAR());
}

/** Hora (0-23) en Argentina de un instante ISO, p. ej. los mensajes de "Historial completo". -1 si es inválido. */
export function horaAR(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return -1;
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: TZ }).format(d));
}

/** Fecha y hora legibles en horario argentino. */
export function fechaHoraAR(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-AR", { timeZone: TZ });
}
