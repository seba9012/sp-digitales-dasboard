import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card } from "@/components/ui";
import { money } from "@/lib/utils";

export const dynamic="force-dynamic";
export default async function Revendedores(){
 const d=await getCRMRepository().getAll();
 const map=new Map<string,{ventas:number;ingresos:number}>();
 d.ventasRevendedor.forEach(v=>{const x=map.get(v.revendedor)||{ventas:0,ingresos:0};x.ventas++;x.ingresos+=v.monto;map.set(v.revendedor,x)});
 return <SectionPage kicker="Partners" title="Revendedores" description="Ventas, vencimientos y rendimiento por revendedor.">
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[...map.entries()].map(([name,x])=><Card key={name} className="p-5"><div className="text-xs text-[var(--muted)]">Revendedor</div><h2 className="mt-1 text-lg font-black">{name}</h2><div className="mt-5 grid grid-cols-2 gap-3"><div><div className="text-xs text-[var(--muted)]">Ventas</div><div className="text-xl font-bold">{x.ventas}</div></div><div><div className="text-xs text-[var(--muted)]">Ingresos</div><div className="text-xl font-bold">{money(x.ingresos)}</div></div></div></Card>)}</div>
 </SectionPage>
}