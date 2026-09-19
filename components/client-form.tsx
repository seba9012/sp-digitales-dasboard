"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Select } from "./ui";
import { Cliente } from "@/lib/types";

const PLANTILLA: Cliente = {
  whatsapp: "", nombre: "", plan: "Netflix 1 pantalla", monto: 3500, estadoPago: "PENDIENTE DE VERIFICACIÓN",
  fechaCompra: new Date().toISOString().slice(0,10), fechaActivacion: "", vencimiento: "", vigente: "NO",
  referenciaPago: "", idMercadoPago: "", correo: "", contrasena: "", dni: "", enviarCuenta: "SÍ",
};

export function ClientForm({ cliente, onClose, onSaved }: { cliente?: Cliente; onClose: () => void; onSaved: () => void }) {
  const esEdicion = Boolean(cliente);
  const [form, setForm] = useState<Cliente>(cliente ?? PLANTILLA);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function campo<K extends keyof Cliente>(k: K, label: string, type = "text") {
    return (
      <label className="block text-sm">
        <span className="mb-1 block text-xs text-[var(--muted)]">{label}</span>
        <Input type={type} value={form[k] as string | number} disabled={k === "whatsapp" && esEdicion}
          onChange={e => {
            const valor = (type === "number" ? Number(e.target.value) : e.target.value) as Cliente[K];
            setForm(f => ({ ...f, [k]: valor }));
          }} />
      </label>
    );
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const r = esEdicion
        ? await fetch("/api/crm/clientes", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ whatsapp: form.whatsapp, patch: form }) })
        : await fetch("/api/crm/clientes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.message ?? `Error ${r.status}`);
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black">{esEdicion ? "Editar cliente" : "Nuevo cliente"}</h2>
          <button onClick={onClose} className="rounded-xl border border-[var(--border)] p-2"><X size={18}/></button>
        </div>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {campo("whatsapp", "WhatsApp (sin espacios)")}
            {campo("nombre", "Nombre")}
            {campo("plan", "Plan")}
            {campo("monto", "Monto", "number")}
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-[var(--muted)]">Estado de pago</span>
              <Select value={form.estadoPago} onChange={e => setForm(f => ({ ...f, estadoPago: e.target.value }))}>
                <option>PAGADO</option><option>PENDIENTE DE VERIFICACIÓN</option><option>RECHAZADO</option>
              </Select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-[var(--muted)]">Vigente</span>
              <Select value={form.vigente} onChange={e => setForm(f => ({ ...f, vigente: e.target.value }))}>
                <option value="SÍ">SÍ</option><option value="NO">NO</option>
              </Select>
            </label>
            {campo("fechaActivacion", "Fecha de activación (dd/mm/aaaa)")}
            {campo("vencimiento", "Vencimiento (dd/mm/aaaa)")}
            {campo("correo", "Correo de la cuenta")}
            {campo("contrasena", "Contraseña de la cuenta")}
            {campo("dni", "Últimos 4 del DNI")}
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button className="w-full" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
        </form>
      </div>
    </div>
  );
}
