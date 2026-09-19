import { getCRMRepository } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { ClientsClient } from "@/components/clients-client";

export const revalidate = 30;

export default async function ClientesPage(){
 const data=await getCRMRepository().getAll();
 return <AppShell><div className="mb-6"><div className="text-sm text-[var(--muted)]">CRM</div><h1 className="mt-1 text-2xl font-black">Clientes</h1><p className="mt-1 text-sm text-[var(--muted)]">Ventas, renovaciones, estado de pago y conversaciones.</p></div><ClientsClient clientes={data.clientes} historial={data.historial}/></AppShell>
}