import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { ChatWindow } from "@/components/chat-window";

export const dynamic = "force-dynamic";

export default async function Conversaciones() {
  const d = await getCRMRepository().getAll();
  return (
    <SectionPage kicker="CRM" title="Conversaciones" description="Chat en vivo con cada cliente, construido desde el Historial completo. Se actualiza solo cada pocos segundos.">
      <ChatWindow initialClientes={d.clientes} initialMensajes={d.historial} />
    </SectionPage>
  );
}
