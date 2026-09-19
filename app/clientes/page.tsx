import { getCRMRepository } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { ClientsClient } from "@/components/clients-client";

export const dynamic="force-dynamic";

export default async function ClientesPage(){
 const data=await getCRMRepository().getAll();
 return <AppShell><div className="mb-6 border-b border-[var(--line)] pb-5"><div className="text-xs font-medium text-[var(--ink-dim)]">CRM</div><h1 className="font-display mt-1 text-[28px] font-medium leading-tight">Clientes</h1><p className="mt-1 text-sm text-[var(--muted)]">Ventas, renovaciones, estado de pago y conversaciones.</p></div><ClientsClient clientes={data.clientes} historial={data.historial}/></AppShell>
}