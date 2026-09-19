import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card, Badge } from "@/components/ui";

export const dynamic="force-dynamic";
export default async function Inventario(){
 const d=await getCRMRepository().getAll();
 const free=d.cuentas.flatMap(c=>c.perfiles).filter(p=>p==="libre").length;
 const occupied=d.cuentas.flatMap(c=>c.perfiles).filter(p=>p==="Ocupado").length;
 return <SectionPage kicker="Operaciones" title="Inventario de cuentas" description="Stock, ocupación por perfil y cuentas cambiadas.">
 <div className="grid gap-4 md:grid-cols-3"><Metric l="Cuentas" v={d.cuentas.length}/><Metric l="Perfiles libres" v={free}/><Metric l="Perfiles ocupados" v={occupied}/></div>
 {free<=2&&<Card className="mt-4 border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><Badge tone="warning">Stock bajo</Badge><p className="mt-2 text-sm">Quedan pocos perfiles libres.</p></Card>}
 <Card className="mt-6 overflow-hidden"><div className="p-5"><h2 className="font-bold">Cuentas</h2></div><div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">{d.cuentas.map(c=><div key={c.idCuenta} className="rounded-2xl border border-[var(--border)] p-4"><div className="font-bold">{c.idCuenta}</div><div className="mt-1 text-sm text-[var(--muted)]">{c.email}</div><div className="mt-4 grid grid-cols-5 gap-1">{c.perfiles.map((p,i)=><div key={i} className={"rounded-lg p-2 text-center text-[10px] font-bold "+(p==="libre"?"bg-emerald-100 text-emerald-700 dark:bg-emerald-950":"bg-gray-100 text-gray-600 dark:bg-gray-800")}><div>P{i+1}</div>{p}</div>)}</div></div>)}</div></Card>
 <Card className="mt-6 p-5"><h2 className="font-bold">Cuentas cambiadas</h2><div className="mt-4 space-y-2">{d.cuentasCambiadas.map((c,i)=><div key={i} className="flex justify-between rounded-xl border border-[var(--border)] p-3 text-sm"><span>{c.email}</span><span className="text-[var(--muted)]">PIN: ••••</span></div>)}</div></Card>
 </SectionPage>
}
function Metric({l,v}:{l:string;v:number}){return <Card className="p-5"><div className="text-xs text-[var(--muted)]">{l}</div><div className="mt-2 text-2xl font-display font-medium">{v}</div></Card>}