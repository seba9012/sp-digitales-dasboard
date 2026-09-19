"use client";
import { X, RefreshCw, MessageSquare, Pencil, Trash2, IdCard } from "lucide-react";
import { Button, Card } from "./ui";
import { ChatWindow } from "./chat-window";
import { Cliente, HistorialMensaje } from "@/lib/types";
import { dateAR, money, cn } from "@/lib/utils";
import { useState } from "react";

export function ClientDrawer({cliente,mensajes,onClose,onEdit,onChanged}:{cliente:Cliente;mensajes:HistorialMensaje[];onClose:()=>void;onEdit:()=>void;onChanged:()=>void}){
 const [showPass,setShowPass]=useState(false);
 const [procesando,setProcesando]=useState(false);
 const [tab,setTab]=useState<"datos"|"chat">("datos");

 async function marcarRenovacion() {
   if (!confirm(`¿Marcar a ${cliente.nombre} como renovado por 30 días más desde hoy?`)) return;
   setProcesando(true);
   try {
     const hoy = new Date();
     const nuevoVencimiento = new Date(hoy); nuevoVencimiento.setDate(nuevoVencimiento.getDate() + 30);
     const fmt = (d: Date) => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
     const r = await fetch("/api/crm/clientes", {
       method: "PATCH", headers: { "content-type": "application/json" },
       body: JSON.stringify({ whatsapp: cliente.whatsapp, patch: { estadoPago: "PAGADO", fechaActivacion: fmt(hoy), vencimiento: fmt(nuevoVencimiento), vigente: "SÍ" } }),
     });
     if (!r.ok) throw new Error((await r.json().catch(()=>null))?.message ?? `Error ${r.status}`);
     onChanged();
   } catch (err) {
     alert(`No se pudo marcar la renovación: ${(err as Error).message}`);
   } finally {
     setProcesando(false);
   }
 }

 async function eliminar() {
   if (!confirm(`¿Eliminar a ${cliente.nombre} de la hoja de Clientes? Esto no se puede deshacer.`)) return;
   setProcesando(true);
   try {
     const r = await fetch("/api/crm/clientes", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ whatsapp: cliente.whatsapp }) });
     if (!r.ok) throw new Error((await r.json().catch(()=>null))?.message ?? `Error ${r.status}`);
     onChanged();
   } catch (err) {
     alert(`No se pudo eliminar: ${(err as Error).message}`);
   } finally {
     setProcesando(false);
   }
 }

 return <div className="fixed inset-0 z-50 flex justify-end bg-black/30"><aside className="flex h-full w-full max-w-xl flex-col bg-[var(--background)] shadow-2xl">
  <div className="overflow-y-auto p-5 pb-0">
    <div className="mb-5 flex items-center justify-between"><div><div className="text-xs text-[var(--muted)]">Ficha de cliente</div><h2 className="text-xl font-black">{cliente.nombre}</h2></div><button onClick={onClose} className="rounded-xl border border-[var(--border)] p-2"><X size={18}/></button></div>

    <div className="mb-4 flex gap-1 rounded-xl border border-[var(--border)] p-1">
      <button onClick={()=>setTab("datos")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold", tab==="datos"?"bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300":"text-[var(--muted)]")}><IdCard size={15}/> Datos</button>
      <button onClick={()=>setTab("chat")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold", tab==="chat"?"bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300":"text-[var(--muted)]")}><MessageSquare size={15}/> Chat</button>
    </div>
  </div>

  {tab==="datos" ? (
    <div className="flex-1 overflow-y-auto p-5 pt-0">
      <Card className="p-4"><div className="grid grid-cols-2 gap-4 text-sm">{[["WhatsApp",cliente.whatsapp],["Plan",cliente.plan],["Monto",money(cliente.monto)],["Compra",dateAR(cliente.fechaCompra)],["Activación",cliente.fechaActivacion?dateAR(cliente.fechaActivacion):"Sin activar"],["Vencimiento",dateAR(cliente.vencimiento)],["Estado",cliente.estadoPago],["Vigente",cliente.vigente],["Correo",cliente.correo],["DNI",cliente.dni],["Referencia",cliente.referenciaPago],["Mercado Pago",cliente.idMercadoPago]].map(([k,v])=><div key={k}><div className="text-xs text-[var(--muted)]">{k}</div><div className="mt-1 font-medium">{v}</div></div>)}</div><div className="mt-4 border-t border-[var(--border)] pt-4"><div className="text-xs text-[var(--muted)]">Contraseña</div><div className="mt-1 flex items-center justify-between"><code>{showPass?cliente.contrasena:"••••••••••••"}</code><button onClick={()=>setShowPass(v=>!v)} className="text-xs font-semibold text-violet-600">{showPass?"Ocultar":"Revelar"}</button></div></div></Card>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={marcarRenovacion} disabled={procesando}><RefreshCw size={16}/> Marcar renovación (+30 días)</Button>
        <Button onClick={onEdit} className="bg-transparent text-[var(--foreground)] border border-[var(--border)]"><Pencil size={16}/> Editar</Button>
        <Button onClick={eliminar} disabled={procesando} className="bg-rose-600"><Trash2 size={16}/> Eliminar</Button>
      </div>
    </div>
  ) : (
    <div className="flex-1 overflow-hidden p-5 pt-0">
      <ChatWindow initialClientes={[cliente]} initialMensajes={mensajes} fixedWhatsapp={cliente.whatsapp} />
    </div>
  )}
 </aside></div>
}
