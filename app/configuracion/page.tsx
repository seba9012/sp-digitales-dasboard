import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { ConfigClient } from "@/components/config-client";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const d = await getCRMRepository().getAll();
  return (
    <SectionPage kicker="Bot" title="Configuración" description="Precios y acciones remotas sobre el bot, sin tocar código.">
      <ConfigClient configuracion={d.configuracion} comandos={d.comandos} estadoBot={d.estadoBot} />
    </SectionPage>
  );
}
