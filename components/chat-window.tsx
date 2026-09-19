"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Circle } from "lucide-react";
import { Cliente, HistorialMensaje } from "@/lib/types";
import { fechaHoraAR } from "@/lib/utils";
import { cn } from "@/lib/utils";

const POLL_MS = 9000;

function iniciales(nombre: string) {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "?";
}

export function ChatWindow({
  initialClientes,
  initialMensajes,
  fixedWhatsapp,
}: {
  initialClientes: Cliente[];
  initialMensajes: HistorialMensaje[];
  fixedWhatsapp?: string;
}) {
  const [clientes, setClientes] = useState(initialClientes);
  const [mensajes, setMensajes] = useState(initialMensajes);
  const [selected, setSelected] = useState<string | null>(fixedWhatsapp ?? null);
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Lista de números con al menos un mensaje, ordenados por el más reciente primero
  const conversaciones = useMemo(() => {
    const porNumero = new Map<string, HistorialMensaje[]>();
    for (const m of mensajes) {
      if (!porNumero.has(m.numero)) porNumero.set(m.numero, []);
      porNumero.get(m.numero)!.push(m);
    }
    return [...porNumero.entries()]
      .map(([numero, msgs]) => {
        const ordenados = [...msgs].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        const cliente = clientes.find(c => c.whatsapp === numero);
        return { numero, nombre: cliente?.nombre ?? numero, ultimo: ordenados.at(-1), cantidad: ordenados.length };
      })
      .sort((a, b) => new Date(b.ultimo?.fecha ?? 0).getTime() - new Date(a.ultimo?.fecha ?? 0).getTime());
  }, [mensajes, clientes]);

  const filtradas = conversaciones.filter(c => c.nombre.toLowerCase().includes(query.toLowerCase()));

  // Si no hay selección (modo lista completa) elige la conversación más reciente
  useEffect(() => {
    if (!fixedWhatsapp && !selected && conversaciones.length) setSelected(conversaciones[0].numero);
  }, [conversaciones, fixedWhatsapp, selected]);

  const chatActivo = useMemo(
    () => mensajes.filter(m => m.numero === selected).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()),
    [mensajes, selected],
  );

  // Auto-refresh (polling) mientras la ventana está abierta
  useEffect(() => {
    if (!live) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/crm", { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        setMensajes(data.historial ?? []);
        setClientes(data.clientes ?? []);
      } catch {
        // silencioso: si falla un ciclo, se reintenta en el próximo
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [live]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatActivo.length, selected]);

  const clienteActivo = clientes.find(c => c.whatsapp === selected);

  return (
    <div className={cn("grid overflow-hidden rounded-2xl border border-[var(--border)]", !fixedWhatsapp && "lg:grid-cols-[300px_1fr]")} style={{ height: fixedWhatsapp ? 480 : 620 }}>
      {!fixedWhatsapp && (
        <div className="hidden flex-col border-r border-[var(--border)] bg-[var(--card)] lg:flex">
          <div className="border-b border-[var(--border)] p-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-xl border border-[var(--border)] bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtradas.map(c => (
              <button
                key={c.numero}
                onClick={() => setSelected(c.numero)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-[var(--border)] p-3 text-left hover:bg-black/5 dark:hover:bg-white/5",
                  selected === c.numero && "bg-violet-50 dark:bg-violet-950/40",
                )}
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {iniciales(c.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{c.nombre}</div>
                  <div className="truncate text-xs text-[var(--muted)]">{c.ultimo?.mensaje ?? "Sin mensajes"}</div>
                </div>
                <div className="shrink-0 text-[10px] text-[var(--muted)]">{c.cantidad}</div>
              </button>
            ))}
            {!filtradas.length && <p className="p-4 text-sm text-[var(--muted)]">No se encontraron conversaciones.</p>}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col bg-[var(--background)]">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              {iniciales(clienteActivo?.nombre ?? selected ?? "?")}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{clienteActivo?.nombre ?? selected ?? "Sin conversación"}</div>
              <div className="truncate text-xs text-[var(--muted)]">{selected}</div>
            </div>
          </div>
          <button
            onClick={() => setLive(v => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold"
            title={live ? "Actualización automática activa" : "Actualización automática pausada"}
          >
            <Circle size={8} className={live ? "fill-emerald-500 text-emerald-500" : "fill-[var(--muted)] text-[var(--muted)]"} />
            {live ? "En vivo" : "Pausado"}
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {chatActivo.length ? chatActivo.map((m, i) => {
            const esCliente = m.rol === "Cliente";
            return (
              <div key={i} className={cn("flex", esCliente ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                  esCliente
                    ? "rounded-bl-sm bg-[var(--card)] border border-[var(--border)]"
                    : "rounded-br-sm bg-[var(--brand)] text-white",
                )}>
                  <p className="whitespace-pre-wrap">{m.mensaje}</p>
                  <div className={cn("mt-1 text-[10px]", esCliente ? "text-[var(--muted)]" : "text-white/70")}>{fechaHoraAR(m.fecha)}</div>
                </div>
              </div>
            );
          }) : <p className="p-6 text-center text-sm text-[var(--muted)]">No hay mensajes con este cliente todavía.</p>}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
