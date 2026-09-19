"use client";
import { useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { Button, Card, Input, Select } from "./ui";
import { VentaRevendedor } from "@/lib/types";

const ESTADOS = ["ACTIVA", "VENCIDA", "CANCELADA"];

export function VentaDrawer({ venta, onClose, onChanged }: { venta: VentaRevendedor; onClose: () => void; onChanged: () => void }) {
  const [form, setForm] = useState<VentaRevendedor>(venta);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof VentaRevendedor>(key: K, value: VentaRevendedor[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function guardar() {
    if (!venta.filaVenta) { setError("Esta venta no tiene fila asociada."); return; }
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`/api/ventas/${venta.filaVenta}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) { setError(data?.error ?? "No se pudo guardar."); return; }
      onChanged();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function eliminar() {
    if (!venta.filaVenta) return;
    if (!confirm(`¿Eliminar la venta de ${form.clienteFinal}? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    setError("");
    try {
      const r = await fetch(`/api/ventas/${venta.filaVenta}`, { method: "DELETE" });
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
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-[var(--bg)] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--ink-dim)]">Venta de revendedor</div>
            <h2 className="font-display text-xl font-medium">{form.clienteFinal}</h2>
            <div className="text-xs text-[var(--ink-dim)]">vendida por {form.revendedor}</div>
          </div>
          <button onClick={onClose} className="rounded-md border border-[var(--line)] p-2 hover:bg-[var(--bg-soft)]"><X size={18} /></button>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <F label="Revendedor"><Input value={form.revendedor} onChange={e => set("revendedor", e.target.value)} /></F>
            <F label="Cliente final"><Input value={form.clienteFinal} onChange={e => set("clienteFinal", e.target.value)} /></F>
            <F label="Plan"><Input value={form.plan} onChange={e => set("plan", e.target.value)} /></F>
            <F label="Monto"><Input type="number" value={form.monto} onChange={e => set("monto", Number(e.target.value))} /></F>
            <F label="Fecha de venta"><Input value={form.fechaVenta} onChange={e => set("fechaVenta", e.target.value)} placeholder="dd/mm/aaaa" /></F>
            <F label="Vencimiento"><Input value={form.vencimiento} onChange={e => set("vencimiento", e.target.value)} placeholder="dd/mm/aaaa" /></F>
            <F label="Correo"><Input value={form.correo} onChange={e => set("correo", e.target.value)} /></F>
            <F label="Perfiles"><Input value={form.perfiles} onChange={e => set("perfiles", e.target.value)} /></F>
            <F label="Estado">
              <Select value={form.estado} onChange={e => set("estado", e.target.value)}>
                {ESTADOS.map(x => <option key={x}>{x}</option>)}
              </Select>
            </F>
          </div>
          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <div className="text-xs text-[var(--ink-dim)]">Contraseña de la cuenta</div>
            <Input className="mt-1" value={form.contrasena} onChange={e => set("contrasena", e.target.value)} />
          </div>
        </Card>

        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

        <div className="mt-5 flex gap-2">
          <Button onClick={guardar} disabled={saving}><Save size={16} /> {saving ? "Guardando…" : "Guardar cambios"}</Button>
          <Button variant="ghost" onClick={eliminar} disabled={saving} className="ml-auto text-[var(--danger)]"><Trash2 size={16} /> Eliminar</Button>
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
