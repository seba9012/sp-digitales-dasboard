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

export function dateAR(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-AR").format(d);
}

export function daysUntil(date: string) {
  const target = new Date(date);
  const now = new Date();
  target.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}
