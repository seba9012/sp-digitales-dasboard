"use client";
import { useMemo, useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";
import { Badge, Card, Input, Select } from "./ui";
import { Cliente } from "@/lib/types";
import { dateAR, money } from "@/lib/utils";

export function ClientTable({clientes,onSelect}:{clientes:Cliente[];onSelect:(c:Cliente)=>void}){
 const [q,setQ]=useState(""); const [estado,setEstado]=useState("TODOS");
 const rows=useMemo(()=>clientes.filter(c=>(estado==="TODOS"||c.estadoPago===estado)&&`${c.nombre} ${c.whatsapp} ${c.plan}`.toLowerCase().includes(q.toLowerCase())),[clientes,q,estado]);
 return <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-[var(--muted)]" size={17}/><Input className="pl-9" placeholder="Buscar cliente, WhatsApp o plan..." value={q} onChange={e=>setQ(e.target.value)}/></div><Select value={estado} onChange={e=>setEstado(e.target.value)}><option>TODOS</option><option>PAGADO</option><option>PENDIENTE DE VERIFICACIÓN</option><option>RECHAZADO</option></Select></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-black/[.02] text-xs uppercase text-[var(--muted)] dark:bg-white/[.02]"><tr><th className="px-4 py-3">Cliente</th><th>Plan</th><th>Monto</th><th>Pago</th><th>Vencimiento</th><th>Cuenta</th><th></th></tr></thead><tbody>{rows.map(c=><tr key={c.whatsapp} className="border-t border-[var(--border)]"><td className="px-4 py-3"><div className="font-semibold">{c.nombre}</div><div className="text-xs text-[var(--muted)]">{c.whatsapp}</div></td><td>{c.plan}</td><td>{money(c.monto)}</td><td><Badge tone={c.estadoPago==="PAGADO"?"success":c.estadoPago==="RECHAZADO"?"danger":"warning"}>{c.estadoPago}</Badge></td><td>{dateAR(c.vencimiento)}</td><td><Password/></td><td><button onClick={()=>onSelect(c)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">Ver ficha</button></td></tr>)}</tbody></table></div></Card>
}
function Password(){const [show,setShow]=useState(false);return <button onClick={()=>setShow(!show)} className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">{show?<EyeOff size={15}/>:<Eye size={15}/>} {show?"Revelada":"Oculta"}</button>}
