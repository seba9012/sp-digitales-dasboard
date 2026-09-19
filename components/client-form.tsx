"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Select } from "./ui";
import { Cliente } from "@/lib/types";

const ESTADOS = ["PENDIENTE DE VERIFICACIÓN", "PAGADO", "RECHAZADO"];

export function ClientForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<Partial<Cliente>>({ estadoPago: "PENDIENTE DE VERIFICACIÓN", vigente: "NO" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof Cliente>(key: K, value: Cliente[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.whatsapp || !form.nombre) { setError("WhatsApp y nombre son obligatorios."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/clientes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) { setError(data?.error ?? "No se pudo crear el cliente."); return; }
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
          <h2 className="font-display text-xl font-medium">Nuevo cliente</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-[var(--line)] p-2 hover:bg-[var(--bg-soft)]"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="WhatsApp *"><Input required value={form.whatsapp ?? ""} onChange={e => set("whatsapp", e.target.value)} placeholder="5491122334455" /></Field>
          <Field label="Nombre *"><Input required value={form.nombre ?? ""} onChange={e => set("nombre", e.target.value)} /></Field>
          <Field label="Plan"><Input value={form.plan ?? ""} onChange={e => set("plan", e.target.value)} /></Field>
          <Field label="Monto"><Input type="number" value={form.monto ?? ""} onChange={e => set("monto", Number(e.target.value))} /></Field>
          <Field label="Estado de pago">
            <Select value={form.estadoPago ?? ""} onChange={e => set("estadoPago", e.target.value)}>
              {ESTADOS.map(x => <option key={x}>{x}</option>)}
            </Select>
          </Field>
          <Field label="Vigente">
            <Select value={form.vigente ?? "NO"} onChange={e => set("vigente", e.target.value)}>
              <option>SÍ</option><option>NO</option>
            </Select>
          </Field>
          <Field label="Vencimiento (dd/mm/aaaa)"><Input value={form.vencimiento ?? ""} onChange={e => set("vencimiento", e.target.value)} placeholder="30/09/2026" /></Field>
          <Field label="Correo"><Input value={form.correo ?? ""} onChange={e => set("correo", e.target.value)} /></Field>
          <Field label="Contraseña"><Input value={form.contrasena ?? ""} onChange={e => set("contrasena", e.target.value)} /></Field>
          <Field label="DNI"><Input value={form.dni ?? ""} onChange={e => set("dni", e.target.value)} /></Field>
        </div>

        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creando…" : "Crear cliente"}</Button>
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
