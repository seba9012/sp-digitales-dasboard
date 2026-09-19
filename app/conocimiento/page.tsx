import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { KnowledgeClient } from "@/components/knowledge-client";

export const dynamic = "force-dynamic";

export default async function Conocimiento() {
  const d = await getCRMRepository().getAll();
  return (
    <SectionPage kicker="Automatización" title="Conocimiento del bot" description="Lo que cargues acá el bot lo tiene en cuenta de verdad al responder, no es solo una lista.">
      <KnowledgeClient items={d.conocimiento} />
    </SectionPage>
  );
}
