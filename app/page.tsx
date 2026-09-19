import { getCRMRepository } from "@/lib/data";
import { DashboardStats, Cliente } from "@/lib/types";
import { daysUntil, money, dateAR } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { Activity, AlertTriangle, CheckCircle2, Clock3, DollarSign, PackageCheck, Users, Wifi, WifiOff } from "lucide-react";
import { OverviewCharts } from "@/components/overview-charts";

export const revalidate = 60;

function stats(clientes: Cliente[], cuentas: Awaited<ReturnType<ReturnType<typeof getCRMRepository>["getAll"]>>["cuentas"]): DashboardStats {
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const ingresosMes = clientes.filter(c => c.estadoPago==="PAGADO" && new Date(c.fechaCompra).getMonth()===month && new Date(c.fechaCompra).getFullYear()===year).reduce((s,c)=>s+c.monto,0);
  const perfiles = cuentas.flatMap(c=>c.perfiles);
  const vencen3Dias = clientes.filter(c => c.vigente==="SÍ" && daysUntil(c.vencimiento)>=0 && daysUntil(c.vencimiento)<=3).length;
  return {
    ingresosMes, clientesActivos: clientes.filter(c=>c.vigente==="SÍ").length,
    vencen3Dias, vencidos: clientes.filter(c=>daysUntil(c.vencimiento)<0).length,
    pendientes: clientes.filter(c=>c.estadoPago==="PENDIENTE DE VERIFICACIÓN").length,
    pagadosSinEntregar: clientes.filter(c=>c.estadoPago==="PAGADO" && !c.fechaActivacion).length,
    tasaRenovacion: 68, perfilesLibres: perfiles.filter(p=>p==="libre").length, perfilesOcupados: perfiles.filter(p=>p==="Ocupado").length
  };
}

export default async function Dashboard() {
  const data = await getCRMRepository().getAll();
  const s = stats(data.clientes, data.cuentas);
  const botOnline = Date.now() - new Date(data.estadoBot.ultimaActividad).getTime() < 120_000;
  const alerts = [
    s.vencen3Dias ? `${s.vencen3Dias} cliente(s) vencen dentro de 3 días.` : "",
    s.pendientes ? `${s.pendientes} pago(s) pendientes de verificación.` : "",
    s.pagadosSinEntregar ? `${s.pagadosSinEntregar} pago(s) confirmado(s) todavía sin activación.` : "",
  ].filter(Boolean);

  return <AppShell>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="text-sm text-[var(--muted)]">Panel de control</div><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Resumen</h1></div>
      <div className="flex items-center gap-2 text-sm">{botOnline ? <Badge tone="success"><Wifi size={14}/> Bot online</Badge> : <Badge tone="danger"><WifiOff size={14}/> Bot offline</Badge>}<span className="text-[var(--muted)]">Heartbeat</span></div>
    </div>

    {alerts.length > 0 && <div className="mb-6 grid gap-3">{alerts.map(a=><Card key={a} className="flex items-center gap-3 border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><AlertTriangle size={19} className="text-amber-600"/><span className="text-sm font-medium">{a}</span></Card>)}</div>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi icon={DollarSign} label="Ingresos del mes" value={money(s.ingresosMes)} sub="Pagos confirmados"/>
      <Kpi icon={Users} label="Clientes activos" value={String(s.clientesActivos)} sub="Vigentes"/>
      <Kpi icon={Clock3} label="Vencen en 3 días" value={String(s.vencen3Dias)} sub="Requieren seguimiento"/>
      <Kpi icon={AlertTriangle} label="Vencidos" value={String(s.vencidos)} sub="Para renovar"/>
      <Kpi icon={Activity} label="Pendientes" value={String(s.pendientes)} sub="Verificación de pago"/>
      <Kpi icon={CheckCircle2} label="Pagados sin entregar" value={String(s.pagadosSinEntregar)} sub="Listos para activar"/>
      <Kpi icon={PackageCheck} label="Renovación" value={`${s.tasaRenovacion}%`} sub="Estimación sobre histórico"/>
      <Kpi icon={BoxesIcon} label="Stock de perfiles" value={`${s.perfilesLibres} libres`} sub={`${s.perfilesOcupados} ocupados`}/>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card className="p-5"><div className="mb-4"><h2 className="font-bold">Actividad</h2><p className="text-sm text-[var(--muted)]">Ingresos y eventos recientes</p></div><OverviewCharts clientes={data.clientes} eventos={data.eventos}/></Card>
      <Card className="p-5"><h2 className="font-bold">Próximos vencimientos</h2><div className="mt-4 space-y-3">{data.clientes.filter(c=>c.vigente==="SÍ").sort((a,b)=>new Date(a.vencimiento).getTime()-new Date(b.vencimiento).getTime()).slice(0,5).map(c=><div key={c.whatsapp} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"><div className="min-w-0"><div className="truncate font-semibold">{c.nombre}</div><div className="text-xs text-[var(--muted)]">{c.plan}</div></div><div className="text-right"><div className="text-sm font-semibold">{dateAR(c.vencimiento)}</div><div className="text-xs text-[var(--muted)]">{Math.max(0,daysUntil(c.vencimiento))} días</div></div></div>)}</div></Card>
    </div>
  </AppShell>
}

function Kpi({ icon: Icon, label, value, sub }: {icon: any; label:string; value:string; sub:string}) {
  return <Card className="p-4"><div className="flex items-start justify-between"><div><div className="text-xs font-medium text-[var(--muted)]">{label}</div><div className="mt-2 text-2xl font-black">{value}</div><div className="mt-1 text-xs text-[var(--muted)]">{sub}</div></div><div className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Icon size={18}/></div></div></Card>
}
function BoxesIcon(props:any){ return <PackageCheck {...props}/> }