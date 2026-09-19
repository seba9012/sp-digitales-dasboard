"use client";
import { useState } from "react";
import { Save, Zap, Wifi, WifiOff } from "lucide-react";
import { Card, Button, Input, Badge } from "./ui";
import { Configuracion, Comando, EstadoBot } from "@/lib/types";
import { fechaHoraAR } from "@/lib/utils";

export function ConfigClient({ configuracion, comandos, estadoBot }: { configuracion: Configuracion; comandos: Comando[]; estadoBot: EstadoBot }) {
  const [form, setForm] = useState(configuracion);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviandoComando, setEnviandoComando] = useState(false);

  const botOnline = Date.now() - new Date(estadoBot.ultimaActividad).getTime() < 120_000;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");
    try {
      const r = await fetch("/api/crm/configuracion", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.message ?? `Error ${r.status}`);
      setMensaje("Precios guardados. El bot los toma solo, en menos de 1 minuto.");
    } catch (err) {
      setMensaje(`No se pudo guardar: ${(err as Error).message}`);
    } finally {
      setGuardando(false);
    }
  }

  async function forzarVencimientos() {
    if (!confirm("Esto le pide al bot que mande YA los avisos de vencimiento (hoy y próximos días) a todos los que correspondan. ¿Seguro?")) return;
    setEnviandoComando(true);
    try {
      const r = await fetch("/api/crm/comandos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: "FORZAR_VENCIMIENTOS" }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.message ?? `Error ${r.status}`);
      alert("Comando enviado. El bot lo va a ejecutar en menos de 1 minuto (revisá acá abajo el resultado).");
      location.reload();
    } catch (err) {
      alert(`No se pudo enviar el comando: ${(err as Error).message}`);
    } finally {
      setEnviandoComando(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Precios</h2>
          {botOnline ? <Badge tone="success"><Wifi size={14}/> Bot online</Badge> : <Badge tone="danger"><WifiOff size={14}/> Bot offline</Badge>}
        </div>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {([1,2,3,4] as const).map(n => (
              <label key={n} className="text-sm">
                <span className="mb-1 block text-xs text-[var(--muted)]">{n} pantalla{n>1?"s":""}</span>
                <Input type="number" min={0} value={form[`precio${n}` as keyof Configuracion]}
                  onChange={e => setForm(f => ({ ...f, [`precio${n}`]: Number(e.target.value) }))} />
              </label>
            ))}
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-[var(--muted)]">Descuento para revendedores ($ menos que el precio normal)</span>
            <Input type="number" min={0} value={form.descuentoReventa}
              onChange={e => setForm(f => ({ ...f, descuentoReventa: Number(e.target.value) }))} />
          </label>
          {mensaje && <p className="text-sm text-[var(--muted)]">{mensaje}</p>}
          <Button disabled={guardando}><Save size={16}/> {guardando ? "Guardando..." : "Guardar precios"}</Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-bold">Acciones sobre el bot</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Estas acciones las ejecuta el bot de verdad (mandan mensajes reales por WhatsApp), no son una simulación.</p>
        <Button className="mt-4" onClick={forzarVencimientos} disabled={enviandoComando}>
          <Zap size={16}/> {enviandoComando ? "Enviando..." : "Forzar avisos de vencimiento ahora"}
        </Button>

        <div className="mt-6">
          <h3 className="text-sm font-bold">Últimos comandos</h3>
          <div className="mt-3 space-y-2">
            {comandos.length === 0 && <p className="text-sm text-[var(--muted)]">Todavía no se mandó ningún comando.</p>}
            {comandos.slice(0,8).map(c => (
              <div key={c.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{c.tipo}</span>
                  <Badge tone={c.estado === "HECHO" ? "success" : c.estado === "ERROR" ? "danger" : "warning"}>{c.estado}</Badge>
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">{fechaHoraAR(c.creado)}</div>
                {c.resultado && <div className="mt-1 text-xs">{c.resultado}</div>}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
