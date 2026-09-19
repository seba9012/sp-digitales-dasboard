import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card, Badge } from "@/components/ui";
import { money, dateAR } from "@/lib/utils";

export const revalidate=60;
export default async function Ventas(){
 const d=await getCRMRepository().getAll();
 const total=d.ventasRevendedor.reduce((s,v)=>s+v.monto,0);
 const plans=[...new Set(d.ventasRevendedor.map(v=>v.plan))];
 return <SectionPage kicker="Finanzas" title="Ventas y finanzas" description="Ingresos por venta, plan y revendedor, con foco en renovaciones.">
 <div className="grid gap-4 md:grid-cols-3"><Metric l="Ventas" v={d.ventasRevendedor.length}/><Metric l="Ingresos" v={money(total)}/><Metric l="Planes" v={plans.length}/></div>
 <Card className="mt-6 overflow-hidden"><div className="p-5"><h2 className="font-bold">Ventas recientes</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="border-y border-[var(--border)] text-xs text-[var(--muted)]"><tr><th className="p-3 text-left">Fecha</th><th className="text-left">Revendedor</th><th className="text-left">Cliente</th><th className="text-left">Plan</th><th className="text-left">Monto</th><th className="text-left">Vencimiento</th><th className="text-left">Estado</th></tr></thead><tbody>{d.ventasRevendedor.map((v,i)=><tr key={i} className="border-b border-[var(--border)]"><td className="p-3">{dateAR(v.fechaVenta)}</td><td>{v.revendedor}</td><td>{v.clienteFinal}</td><td>{v.plan}</td><td>{money(v.monto)}</td><td>{dateAR(v.vencimiento)}</td><td><Badge tone={v.estado==="ACTIVA"?"success":"danger"}>{v.estado}</Badge></td></tr>)}</tbody></table></div></Card>
 </SectionPage>
}
function Metric({l,v}:{l:string;v:string|number}){return <Card className="p-5"><div className="text-xs text-[var(--muted)]">{l}</div><div className="mt-2 text-2xl font-black">{v}</div></Card>}