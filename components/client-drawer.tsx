"use client";
import { X, RefreshCw, Trash2, Save } from "lucide-react";
import { Button, Card, Input, Select } from "./ui";
import { Cliente, HistorialMensaje } from "@/lib/types";
import { dateAR, money, fechaHoraAR, isoDate } from "@/lib/utils";
import { useState } from "react";

const ESTADOS = ["PENDIENTE DE VERIFICACIÓN", "PAGADO", "RECHAZADO"];

function sumarDias(fechaDDMMYYYY: string, dias: number): string {
  const base = isoDate(fechaDDMMYYYY) ?? new Date().toISOString().slice(0, 10);
  const d = new Date(`${base}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

export function ClientDrawer({ cliente, mensajes, onClose, onChanged }: { cliente: Cliente; mensajes: HistorialMensaje[]; onClose: () => void; onChanged: () => void }) {
  const [form, setForm] = useState<Cliente>(cliente);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const chat = mensajes.filter(m => m.numero === cliente.whatsapp);

  function set<K extends keyof Cliente>(key: K, value: Cliente[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function guardar(patch: Partial<Cliente> = form) {
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`/api/clientes/${encodeURIComponent(cliente.whatsapp)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) { setError(data?.error ?? "No se pudo guardar."); return; }
      setForm(f => ({ ...f, ...patch }));
      onChanged();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function marcarRenovacion() {
    const nuevoVencimiento = sumarDias(form.vencimiento || form.fechaCompra, 30);
    const patch: Partial<Cliente> = { vencimiento: nuevoVencimiento, vigente: "SÍ", estadoPago: "PAGADO" };
    await guardar(patch);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a ${form.nombre}? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`/api/clientes/${encodeURIComponent(cliente.whatsapp)}`, { method: "DELETE" });
      if (!r.ok) { const d = await r.json().catch(() => null); setError(d?.error ?? "No se pudo eliminar."); return; }
      onChanged();
      onClose();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-[var(--bg)] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--ink-dim)]">Ficha de cliente</div>
            <h2 className="font-display text-xl font-medium">{form.nombre}</h2>
            <div className="text-xs text-[var(--ink-dim)]">{form.whatsapp}</div>
          </div>
          <button onClick={onClose} className="rounded-md border border-[var(--line)] p-2 hover:bg-[var(--bg-soft)]"><X size={18} /></button>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <F label="Nombre"><Input value={form.nombre} onChange={e => set("nombre", e.target.value)} /></F>
            <F label="Plan"><Input value={form.plan} onChange={e => set("plan", e.target.value)} /></F>
            <F label="Monto"><Input type="number" value={form.monto} onChange={e => set("monto", Number(e.target.value))} /></F>
            <F label="Estado de pago">
              <Select value={form.estadoPago} onChange={e => set("estadoPago", e.target.value)}>
                {ESTADOS.map(x => <option key={x}>{x}</option>)}
              </Select>
            </F>
            <F label="Vigente">
              <Select value={form.vigente} onChange={e => set("vigente", e.target.value)}>
                <option>SÍ</option><option>NO</option>
              </Select>
            </F>
            <F label="Vencimiento"><Input value={form.vencimiento} onChange={e => set("vencimiento", e.target.value)} placeholder="dd/mm/aaaa" /></F>
            <F label="Activación"><Input value={form.fechaActivacion} onChange={e => set("fechaActivacion", e.target.value)} placeholder="dd/mm/aaaa" /></F>
            <F label="Compra"><span className="tabular block py-2.5">{dateAR(form.fechaCompra)}</span></F>
            <F label="Correo"><Input value={form.correo} onChange={e => set("correo", e.target.value)} /></F>
            <F label="DNI"><Input value={form.dni} onChange={e => set("dni", e.target.value)} /></F>
            <F label="Referencia"><Input value={form.referenciaPago} onChange={e => set("referenciaPago", e.target.value)} /></F>
            <F label="Mercado Pago"><Input value={form.idMercadoPago} onChange={e => set("idMercadoPago", e.target.value)} /></F>
          </div>
          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <div className="text-xs text-[var(--ink-dim)]">Contraseña</div>
            <div className="mt-1 flex items-center gap-2">
              <Input className="flex-1" type={showPass ? "text" : "password"} value={form.contrasena} onChange={e => set("contrasena", e.target.value)} />
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-xs font-semibold text-[var(--signal)]">{showPass ? "Ocultar" : "Revelar"}</button>
            </div>
          </div>
        </Card>

        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => guardar()} disabled={saving}><Save size={16} /> {saving ? "Guardando…" : "Guardar cambios"}</Button>
          <Button variant="ghost" onClick={marcarRenovacion} disabled={saving}><RefreshCw size={16} /> Marcar renovación (+30 días)</Button>
          <Button variant="ghost" onClick={eliminar} disabled={saving} className="ml-auto text-[var(--danger)]"><Trash2 size={16} /> Eliminar</Button>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-base font-medium">Chat completo</h3>
          <div className="mt-3 space-y-2">
            {chat.length ? chat.map((m, i) => (
              <div key={i} className={m.rol === "Cliente" ? "mr-8" : "ml-8"}>
                <div className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-dim)]">{m.rol}</div>
                  <div className="text-sm">{m.mensaje}</div>
                  <div className="mt-1 text-[10px] text-[var(--ink-dim)]">{fechaHoraAR(m.fecha)}</div>
                </div>
              </div>
            )) : <p className="text-sm text-[var(--ink-dim)]">No hay mensajes.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--ink-dim)]">{label}</span>
      {children}
    </label>
  );
}
