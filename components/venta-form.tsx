"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Select } from "./ui";
import { VentaRevendedor } from "@/lib/types";

const ESTADOS = ["ACTIVA", "VENCIDA", "CANCELADA"];

export function VentaForm({ revendedores, onClose, onCreated }: { revendedores: string[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<Partial<VentaRevendedor>>({ estado: "ACTIVA" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof VentaRevendedor>(key: K, value: VentaRevendedor[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.revendedor || !form.clienteFinal) { setError("Revendedor y cliente final son obligatorios."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/ventas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) { setError(data?.error ?? "No se pudo crear la venta."); return; }
      onCreated();
      onClose();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border border-[var(--line)] bg-[var(--bg)] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Nueva venta de revendedor</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-[var(--line)] p-2 hover:bg-[var(--bg-soft)]"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Revendedor *">
            <Input required list="revendedores-list" value={form.revendedor ?? ""} onChange={e => set("revendedor", e.target.value)} />
            <datalist id="revendedores-list">{revendedores.map(r => <option key={r} value={r} />)}</datalist>
          </Field>
          <Field label="Cliente final *"><Input required value={form.clienteFinal ?? ""} onChange={e => set("clienteFinal", e.target.value)} /></Field>
          <Field label="Plan"><Input value={form.plan ?? ""} onChange={e => set("plan", e.target.value)} /></Field>
          <Field label="Monto"><Input type="number" value={form.monto ?? ""} onChange={e => set("monto", Number(e.target.value))} /></Field>
          <Field label="Fecha de venta (dd/mm/aaaa)"><Input value={form.fechaVenta ?? ""} onChange={e => set("fechaVenta", e.target.value)} /></Field>
          <Field label="Vencimiento (dd/mm/aaaa)"><Input value={form.vencimiento ?? ""} onChange={e => set("vencimiento", e.target.value)} /></Field>
          <Field label="Correo de la cuenta"><Input value={form.correo ?? ""} onChange={e => set("correo", e.target.value)} /></Field>
          <Field label="Contraseña"><Input value={form.contrasena ?? ""} onChange={e => set("contrasena", e.target.value)} /></Field>
          <Field label="Perfiles"><Input value={form.perfiles ?? ""} onChange={e => set("perfiles", e.target.value)} placeholder="ej. Perfil 2" /></Field>
          <Field label="Estado">
            <Select value={form.estado ?? "ACTIVA"} onChange={e => set("estado", e.target.value)}>
              {ESTADOS.map(x => <option key={x}>{x}</option>)}
            </Select>
          </Field>
        </div>

        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creando…" : "Crear venta"}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs text-[var(--ink-dim)]">{label}</span>
      {children}
    </label>
  );
}
