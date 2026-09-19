"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Card, Badge, Button, Input, Select } from "./ui";
import { Conocimiento } from "@/lib/types";

const PLANTILLA: Conocimiento = { id: "", categoria: "General", titulo: "", contenido: "", activo: "SÍ", actualizado: "" };

export function KnowledgeClient({ items }: { items: Conocimiento[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<Conocimiento | null>(null);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function abrirForm(item?: Conocimiento) {
    setError("");
    if (item) setEditando(item); else { setEditando(PLANTILLA); setCreando(true); }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setGuardando(true);
    setError("");
    try {
      const r = creando
        ? await fetch("/api/crm/conocimiento", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(editando) })
        : await fetch("/api/crm/conocimiento", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: editando.id, patch: editando }) });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.message ?? `Error ${r.status}`);
      cerrar();
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este ítem de conocimiento? El bot va a dejar de tenerlo en cuenta en menos de 1 minuto.")) return;
    const r = await fetch("/api/crm/conocimiento", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) { alert("No se pudo eliminar."); return; }
    router.refresh();
  }

  function cerrar() { setEditando(null); setCreando(false); }

  return <>
    <div className="mb-4 flex justify-end"><Button onClick={() => abrirForm()}><Plus size={16}/> Nuevo ítem</Button></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map(k => (
        <Card key={k.id} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div><div className="text-xs uppercase tracking-wide text-[var(--muted)]">{k.categoria}</div><h2 className="mt-1 font-bold">{k.titulo}</h2></div>
            <Badge tone={k.activo === "SÍ" ? "success" : "neutral"}>{k.activo === "SÍ" ? "Activo" : "Inactivo"}</Badge>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{k.contenido}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Actualizado: {k.actualizado}</span>
            <div className="flex gap-2">
              <button onClick={() => abrirForm(k)} className="rounded-lg border border-[var(--border)] p-1.5"><Pencil size={14}/></button>
              <button onClick={() => eliminar(k.id)} className="rounded-lg border border-[var(--border)] p-1.5 text-rose-600"><Trash2 size={14}/></button>
            </div>
          </div>
        </Card>
      ))}
      {items.length === 0 && <p className="text-sm text-[var(--muted)]">Todavía no hay nada cargado. Agregá el primer ítem con el botón de arriba.</p>}
    </div>

    {editando && (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">{creando ? "Nuevo ítem de conocimiento" : "Editar ítem"}</h2>
            <button onClick={cerrar} className="rounded-xl border border-[var(--border)] p-2"><X size={18}/></button>
          </div>
          <form onSubmit={guardar} className="space-y-4">
            <label className="block text-sm"><span className="mb-1 block text-xs text-[var(--muted)]">Categoría</span>
              <Input value={editando.categoria} onChange={e => setEditando(v => v && { ...v, categoria: e.target.value })}/></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-[var(--muted)]">Título</span>
              <Input value={editando.titulo} onChange={e => setEditando(v => v && { ...v, titulo: e.target.value })}/></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-[var(--muted)]">Contenido (esto es lo que el bot va a tener en cuenta al responder)</span>
              <textarea className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300" rows={4}
                value={editando.contenido} onChange={e => setEditando(v => v && { ...v, contenido: e.target.value })}/></label>
            <label className="block text-sm"><span className="mb-1 block text-xs text-[var(--muted)]">Estado</span>
              <Select value={editando.activo} onChange={e => setEditando(v => v && { ...v, activo: e.target.value })}>
                <option value="SÍ">Activo (el bot lo usa)</option><option value="NO">Inactivo (guardado, pero el bot lo ignora)</option>
              </Select></label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button className="w-full" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
          </form>
        </div>
      </div>
    )}
  </>;
}
