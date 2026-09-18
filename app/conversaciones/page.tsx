import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card, Badge } from "@/components/ui";

export const dynamic="force-dynamic";
export default async function Conversaciones(){
 const d=await getCRMRepository().getAll();
 const nums=[...new Set(d.historial.map(m=>m.numero))];
 return <SectionPage kicker="CRM" title="Conversaciones" description="Visor de conversaciones construido desde Historial completo.">
 <div className="grid gap-4 lg:grid-cols-[300px_1fr]"><Card className="p-3">{nums.map(n=><div key={n} className="rounded-xl p-3 hover:bg-black/5 dark:hover:bg-white/5"><div className="font-semibold">{d.clientes.find(c=>c.whatsapp===n)?.nombre??n}</div><div className="text-xs text-[var(--muted)]">{d.historial.filter(m=>m.numero===n).length} mensajes</div></div>)}</Card><Card className="p-5"><div className="mb-4 flex flex-wrap gap-2"><Badge tone="warning">Pendientes</Badge><Badge tone="info">Derivados</Badge></div><div className="space-y-3">{d.historial.map((m,i)=><div key={i} className="rounded-2xl border border-[var(--border)] p-3"><div className="flex justify-between"><span className="text-xs font-bold">{m.rol}</span><span className="text-xs text-[var(--muted)]">{new Date(m.fecha).toLocaleString("es-AR")}</span></div><p className="mt-1 text-sm">{m.mensaje}</p></div>)}</div></Card></div></SectionPage>
}