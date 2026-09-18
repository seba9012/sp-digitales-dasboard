import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card, Badge } from "@/components/ui";

export const dynamic="force-dynamic";
export default async function Conocimiento(){
 const d=await getCRMRepository().getAll();
 return <SectionPage kicker="Automatización" title="Conocimiento del bot" description="CRUD preparado para la hoja NUEVAS / Conocimiento.">
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{d.conocimiento.map(k=><Card key={k.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-xs uppercase tracking-wide text-[var(--muted)]">{k.categoria}</div><h2 className="mt-1 font-bold">{k.titulo}</h2></div><Badge tone={k.activo==="SÍ"?"success":"neutral"}>{k.activo==="SÍ"?"Activo":"Inactivo"}</Badge></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{k.contenido}</p><div className="mt-4 text-xs text-[var(--muted)]">Actualizado: {k.actualizado}</div></Card>)}</div>
 </SectionPage>
}