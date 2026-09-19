import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card } from "@/components/ui";
import { money } from "@/lib/utils";
import { VentasClient } from "@/components/ventas-client";

export const dynamic = "force-dynamic";

export default async function Ventas() {
  const d = await getCRMRepository().getAll();
  const total = d.ventasRevendedor.reduce((s, v) => s + v.monto, 0);
  const plans = [...new Set(d.ventasRevendedor.map(v => v.plan))];

  return (
    <SectionPage kicker="Finanzas" title="Ventas y finanzas" description="Ingresos por venta, plan y revendedor, con foco en renovaciones.">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric l="Ventas" v={d.ventasRevendedor.length} />
        <Metric l="Ingresos" v={money(total)} />
        <Metric l="Planes" v={plans.length} />
      </div>
      <div className="mt-6">
        <VentasClient ventas={d.ventasRevendedor} />
      </div>
    </SectionPage>
  );
}

function Metric({ l, v }: { l: string; v: string | number }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium text-[var(--ink-dim)]">{l}</div>
      <div className="tabular mt-2 text-2xl font-semibold">{v}</div>
    </Card>
  );
}
