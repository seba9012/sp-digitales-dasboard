"use client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Cliente, Evento } from "@/lib/types";
import { money } from "@/lib/utils";

export function OverviewCharts({clientes, eventos}:{clientes:Cliente[]; eventos:Evento[]}) {
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i)); const key=d.toISOString().slice(0,10);
    return {name:d.toLocaleDateString("es-AR",{weekday:"short"}), ingresos:clientes.filter(c=>c.estadoPago==="PAGADO"&&c.fechaCompra===key).reduce((s,c)=>s+c.monto,0), eventos:eventos.filter(e=>e.fecha===key).length};
  });
  return <div className="grid gap-6 md:grid-cols-2">
    <div className="h-64"><div className="mb-2 text-xs text-[var(--muted)]">Ingresos · últimos 7 días</div><ResponsiveContainer width="100%" height="90%"><LineChart data={days}><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(v)=>money(Number(v))}/><Line type="monotone" dataKey="ingresos" stroke="currentColor" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>
    <div className="h-64"><div className="mb-2 text-xs text-[var(--muted)]">Eventos del bot · últimos 7 días</div><ResponsiveContainer width="100%" height="90%"><BarChart data={days}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="eventos" fill="currentColor" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div>
  </div>
}