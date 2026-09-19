"use client";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Cliente, Evento } from "@/lib/types";
import { money, isoDate, hoyAR } from "@/lib/utils";

const tooltipStyle = {
  background: "var(--card-raised)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow)",
};

export function OverviewCharts({ clientes, eventos }: { clientes: Cliente[]; eventos: Evento[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${hoyAR()}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      name: d.toLocaleDateString("es-AR", { weekday: "short", timeZone: "UTC" }),
      ingresos: clientes.filter(c => c.estadoPago === "PAGADO" && isoDate(c.fechaCompra) === key).reduce((s, c) => s + c.monto, 0),
      eventos: eventos.filter(e => isoDate(e.fecha) === key).length,
    };
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-64">
        <div className="mb-3 text-xs font-medium text-[var(--ink-dim)]">Ingresos · últimos 7 días</div>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={days}>
            <defs>
              <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "var(--ink-dim)", fontSize: 11 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} formatter={v => money(Number(v))} />
            <Area type="monotone" dataKey="ingresos" stroke="var(--signal)" strokeWidth={2} fill="url(#fillIngresos)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64">
        <div className="mb-3 text-xs font-medium text-[var(--ink-dim)]">Eventos del bot · últimos 7 días</div>
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={days}>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "var(--ink-dim)", fontSize: 11 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="eventos" fill="var(--pulse)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
