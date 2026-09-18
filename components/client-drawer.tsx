"use client";
import { X, RefreshCw, MessageSquare } from "lucide-react";
import { Badge, Button, Card } from "./ui";
import { Cliente, HistorialMensaje } from "@/lib/types";
import { dateAR, money } from "@/lib/utils";
import { useState } from "react";

export function ClientDrawer({cliente,mensajes,onClose}:{cliente:Cliente;mensajes:HistorialMensaje[];onClose:()=>void}){
 const [showPass,setShowPass]=useState(false);
 const chat=mensajes.filter(m=>m.numero===cliente.whatsapp);
 return <div className="fixed inset-0 z-50 flex justify-end bg-black/30"><aside className="h-full w-full max-w-xl overflow-y-auto bg-[var(--background)] p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><div className="text-xs text-[var(--muted)]">Ficha de cliente</div><h2 className="text-xl font-black">{cliente.nombre}</h2></div><button onClick={onClose} className="rounded-xl border border-[var(--border)] p-2"><X size={18}/></button></div>
 <Card className="p-4"><div className="grid grid-cols-2 gap-4 text-sm">{[["WhatsApp",cliente.whatsapp],["Plan",cliente.plan],["Monto",money(cliente.monto)],["Compra",dateAR(cliente.fechaCompra)],["Activación",cliente.fechaActivacion?dateAR(cliente.fechaActivacion):"Sin activar"],["Vencimiento",dateAR(cliente.vencimiento)],["Estado",cliente.estadoPago],["Vigente",cliente.vigente],["Correo",cliente.correo],["DNI",cliente.dni],["Referencia",cliente.referenciaPago],["Mercado Pago",cliente.idMercadoPago]].map(([k,v])=><div key={k}><div className="text-xs text-[var(--muted)]">{k}</div><div className="mt-1 font-medium">{v}</div></div>)}</div><div className="mt-4 border-t border-[var(--border)] pt-4"><div className="text-xs text-[var(--muted)]">Contraseña</div><div className="mt-1 flex items-center justify-between"><code>{showPass?cliente.contrasena:"••••••••••••"}</code><button onClick={()=>setShowPass(v=>!v)} className="text-xs font-semibold text-violet-600">{showPass?"Ocultar":"Revelar"}</button></div></div></Card>
 <div className="mt-5 flex gap-2"><Button><RefreshCw size={16}/> Marcar renovación</Button><Button className="bg-transparent text-[var(--foreground)] border border-[var(--border)]"><MessageSquare size={16}/> Ver chat</Button></div>
 <div className="mt-6"><h3 className="font-bold">Chat completo</h3><div className="mt-3 space-y-2">{chat.length?chat.map((m,i)=><div key={i} className={m.rol==="Cliente"?"mr-8":"ml-8"}><div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"><div className="mb-1 text-[10px] font-bold uppercase text-[var(--muted)]">{m.rol}</div><div className="text-sm">{m.mensaje}</div><div className="mt-1 text-[10px] text-[var(--muted)]">{new Date(m.fecha).toLocaleString("es-AR")}</div></div></div>):<p className="text-sm text-[var(--muted)]">No hay mensajes.</p>}</div></div>
 </aside></div>
}