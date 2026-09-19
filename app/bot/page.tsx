import { getCRMRepository } from "@/lib/data";
import { SectionPage } from "@/components/section-page";
import { Card } from "@/components/ui";
import { BotCharts } from "@/components/bot-charts";
import { horaAR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BotPage() {
  const d = await getCRMRepository().getAll();
  const byType = Object.entries(Object.groupBy(d.eventos, e => e.tipo)).map(([name, items]) => ({ name, value: items?.length ?? 0 }));
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: String(h).padStart(2, "0"), value: d.historial.filter(m => horaAR(m.fecha) === h).length }));
  const derivados = d.eventos.filter(e => e.tipo === "DERIVADO").length;
  const resueltos = d.eventos.filter(e => e.tipo === "INCIDENCIA_RESUELTA").length;
  const pico = byHour.reduce((max, x) => (x.value > max.value ? x : max), byHour[0]);
  const maxHora = Math.max(1, ...byHour.map(x => x.value));

  return (
    <SectionPage kicker="Analytics" title="Comportamiento del bot" description="Métricas operativas y embudo a partir de Historial y NUEVAS/Eventos.">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Mensajes totales" value={d.historial.length} />
        <Metric label="Eventos registrados" value={d.eventos.length} />
        <Metric label="Resueltos solo / derivados" value={`${resueltos} / ${derivados}`} />
        <Metric label="Hora pico" value={`${pico?.hour ?? "—"}h`} />
      </div>

      <BotCharts byHour={byHour} byType={byType} />

      <Card className="mt-6 p-5">
        <h2 className="font-display text-lg font-medium">Mapa de calor por hora</h2>
        <p className="text-xs text-[var(--ink-dim)]">Intensidad de mensajes recibidos, hora a hora (AR)</p>
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-12">
          {byHour.map(x => {
            const intensity = x.value / maxHora;
            return (
              <div
                key={x.hour}
                className="rounded-md border border-[var(--line)] p-2 text-center"
                style={{ background: intensity > 0 ? `color-mix(in srgb, var(--signal) ${Math.round(intensity * 55)}%, var(--card))` : undefined }}
              >
                <div className="text-[10px] text-[var(--ink-dim)]">{x.hour}h</div>
                <div className="tabular mt-1 text-sm font-semibold">{x.value}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </SectionPage>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium text-[var(--ink-dim)]">{label}</div>
      <div className="tabular mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
}
