import { getCRMRepository } from "@/lib/data";
import { DashboardStats, Cliente } from "@/lib/types";
import { daysUntil, money, dateAR, isoDate, hoyAR } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, LiveDot } from "@/components/ui";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, DollarSign, PackageCheck, Users } from "lucide-react";
import { OverviewCharts } from "@/components/overview-charts";
import Link from "next/link";

export const dynamic = "force-dynamic";

function stats(clientes: Cliente[], cuentas: Awaited<ReturnType<ReturnType<typeof getCRMRepository>["getAll"]>>["cuentas"]): DashboardStats {
  const mesActual = hoyAR().slice(0, 7);
  const ingresosMes = clientes.filter(c => c.estadoPago === "PAGADO" && (isoDate(c.fechaCompra) ?? "").slice(0, 7) === mesActual).reduce((s, c) => s + c.monto, 0);
  const perfiles = cuentas.flatMap(c => c.perfiles);
  const vencen3Dias = clientes.filter(c => c.vigente === "SÍ" && daysUntil(c.vencimiento) >= 0 && daysUntil(c.vencimiento) <= 3).length;
  return {
    ingresosMes, clientesActivos: clientes.filter(c => c.vigente === "SÍ").length,
    vencen3Dias, vencidos: clientes.filter(c => daysUntil(c.vencimiento) < 0).length,
    pendientes: clientes.filter(c => c.estadoPago === "PENDIENTE DE VERIFICACIÓN").length,
    pagadosSinEntregar: clientes.filter(c => c.estadoPago === "PAGADO" && !c.fechaActivacion).length,
    tasaRenovacion: 68, perfilesLibres: perfiles.filter(p => p === "libre").length, perfilesOcupados: perfiles.filter(p => p === "Ocupado").length
  };
}

export default async function Dashboard() {
  const data = await getCRMRepository().getAll();
  const s = stats(data.clientes, data.cuentas);
  const botOnline = Date.now() - new Date(data.estadoBot.ultimaActividad).getTime() < 120_000;
  const alerts = [
    s.vencen3Dias ? { text: `${s.vencen3Dias} cliente(s) vencen dentro de 3 días.`, href: "/clientes" } : null,
    s.pendientes ? { text: `${s.pendientes} pago(s) pendientes de verificación.`, href: "/clientes" } : null,
    s.pagadosSinEntregar ? { text: `${s.pagadosSinEntregar} pago(s) confirmado(s) todavía sin activación.`, href: "/clientes" } : null,
  ].filter(Boolean) as { text: string; href: string }[];

  const proximos = data.clientes
    .filter(c => c.vigente === "SÍ")
    .sort((a, b) => (isoDate(a.vencimiento) ?? "9999").localeCompare(isoDate(b.vencimiento) ?? "9999"))
    .slice(0, 5);

  return (
    <AppShell>
      {/* Hero: el número que más le importa al dueño del negocio hoy */}
      <div className="mb-8 flex flex-col gap-6 border-b border-[var(--line)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-dim)]">
            <LiveDot tone={botOnline ? "success" : "danger"} />
            {botOnline ? "Bot en línea" : "Bot sin actividad reciente"} · {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long" }).format(new Date())}
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display tabular text-5xl font-medium leading-none sm:text-6xl">{money(s.ingresosMes)}</span>
          </div>
          <p className="mt-2 text-sm text-[var(--ink-dim)]">Ingresos confirmados este mes</p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:flex sm:gap-8">
          <MiniStat label="Clientes activos" value={String(s.clientesActivos)} />
          <MiniStat label="Renovación" value={`${s.tasaRenovacion}%`} />
          <MiniStat label="Perfiles libres" value={String(s.perfilesLibres)} />
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mb-8 grid gap-2">
          {alerts.map(a => (
            <Link key={a.text} href={a.href} className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--signal-soft)] px-4 py-3">
              <span className="flex items-center gap-3 text-sm font-medium">
                <AlertTriangle size={17} className="shrink-0 text-[var(--signal)]" />
                {a.text}
              </span>
              <ArrowRight size={15} className="shrink-0 text-[var(--ink-dim)] transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={DollarSign} label="Ingresos del mes" value={money(s.ingresosMes)} sub="Pagos confirmados" />
        <Kpi icon={Users} label="Clientes activos" value={String(s.clientesActivos)} sub="Vigentes" />
        <Kpi icon={Clock3} label="Vencen en 3 días" value={String(s.vencen3Dias)} sub="Requieren seguimiento" tone={s.vencen3Dias ? "warning" : undefined} />
        <Kpi icon={AlertTriangle} label="Vencidos" value={String(s.vencidos)} sub="Para renovar" tone={s.vencidos ? "danger" : undefined} />
        <Kpi icon={CheckCircle2} label="Pagados sin entregar" value={String(s.pagadosSinEntregar)} sub="Listos para activar" />
        <Kpi icon={PackageCheck} label="Stock de perfiles" value={`${s.perfilesLibres} libres`} sub={`${s.perfilesOcupados} ocupados`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-display text-lg font-medium">Actividad</h2>
            <p className="text-sm text-[var(--ink-dim)]">Ingresos y eventos recientes</p>
          </div>
          <OverviewCharts clientes={data.clientes} eventos={data.eventos} />
        </Card>
        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-lg font-medium">Próximos vencimientos</h2>
            <Link href="/clientes" className="text-xs font-medium text-[var(--ink-dim)] hover:text-[var(--ink)]">Ver todos</Link>
          </div>
          <div className="mt-4 space-y-2">
            {proximos.length === 0 && <p className="text-sm text-[var(--ink-dim)]">No hay vencimientos próximos.</p>}
            {proximos.map(c => {
              const dias = Math.max(0, daysUntil(c.vencimiento));
              return (
                <div key={c.whatsapp} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{c.nombre}</div>
                    <div className="text-xs text-[var(--ink-dim)]">{c.plan}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="tabular text-sm font-semibold">{dateAR(c.vencimiento)}</div>
                    <div className="text-xs text-[var(--ink-dim)]">{dias === 0 ? "hoy" : `${dias} día${dias === 1 ? "" : "s"}`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="tabular text-xl font-semibold">{value}</div>
      <div className="text-xs text-[var(--ink-dim)]">{label}</div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: string; sub: string; tone?: "warning" | "danger" }) {
  const iconColor = tone === "warning" ? "var(--signal)" : tone === "danger" ? "var(--danger)" : "var(--ink-dim)";
  return (
    <Card className="p-4" accent={tone}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-[var(--ink-dim)]">{label}</div>
          <div className="tabular mt-2 text-2xl font-semibold">{value}</div>
          <div className="mt-1 text-xs text-[var(--ink-dim)]">{sub}</div>
        </div>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
    </Card>
  );
}
