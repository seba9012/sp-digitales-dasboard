import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card, Badge } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

export const revalidate=60;
export default async function BotPage(){
 const d=await getCRMRepository().getAll();
 const byType=Object.entries(Object.groupBy(d.eventos,e=>e.tipo)).map(([name,items])=>({name,value:items?.length??0}));
 const byHour=Array.from({length:24},(_,h)=>({hour:String(h).padStart(2,"0"),value:d.historial.filter(m=>new Date(m.fecha).getHours()===h).length}));
 const derivados=d.eventos.filter(e=>e.tipo==="DERIVADO").length;
 const resueltos=d.eventos.filter(e=>e.tipo==="INCIDENCIA_RESUELTA").length;
 return <SectionPage kicker="Analytics" title="Comportamiento del bot" description="Métricas operativas y embudo a partir de Historial y NUEVAS/Eventos.">
 <div className="grid gap-4 md:grid-cols-3"><Metric label="Mensajes" value={d.historial.length}/><Metric label="Eventos" value={d.eventos.length}/><Metric label="Resuelto solo / derivado" value={`${resueltos} / ${derivados}`}/></div>
 <div className="mt-6 grid gap-6 xl:grid-cols-2"><Card className="p-5"><h2 className="font-bold">Mensajes por hora</h2><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={byHour}><XAxis dataKey="hour"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="currentColor"/></BarChart></ResponsiveContainer></div></Card><Card className="p-5"><h2 className="font-bold">Eventos por tipo</h2><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byType} dataKey="value" nameKey="name" outerRadius={95} label>{byType.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></Card></div>
 <Card className="mt-6 p-5"><h2 className="font-bold">Heatmap operativo</h2><div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-12">{byHour.map(x=><div key={x.hour} className="rounded-lg border border-[var(--border)] p-2 text-center"><div className="text-[10px] text-[var(--muted)]">{x.hour}h</div><div className="mt-1 font-bold">{x.value}</div></div>)}</div></Card>
 </SectionPage>
}
function Metric({label,value}:{label:string;value:string|number}){return <Card className="p-5"><div className="text-xs text-[var(--muted)]">{label}</div><div className="mt-2 text-2xl font-black">{value}</div></Card>}