"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { Cliente, HistorialMensaje } from "@/lib/types";
import { ClientTable } from "./data-table";
import { ClientDrawer } from "./client-drawer";
import { ClientForm } from "./client-form";
import { Button } from "./ui";

export function ClientsClient({clientes,historial}:{clientes:Cliente[];historial:HistorialMensaje[]}){
 const router = useRouter();
 const [selected,setSelected]=useState<Cliente|null>(null);
 const [editando,setEditando]=useState<Cliente|null>(null);
 const [creando,setCreando]=useState(false);

 function csv(){const head=["whatsapp","nombre","plan","monto","estadoPago","fechaCompra","fechaActivacion","vencimiento","vigente","referenciaPago","idMercadoPago","correo","contrasena","dni"];const body=clientes.map(c=>head.map(k=>`"${String(c[k as keyof Cliente]??"").replaceAll('"','""')}"`).join(","));const blob=new Blob([[head.join(","),...body].join("\n")],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="clientes.csv";a.click();URL.revokeObjectURL(a.href)}

 function onSaved() {
   setCreando(false);
   setEditando(null);
   setSelected(null);
   router.refresh();
 }

 return <>
  <div className="mb-4 flex justify-end gap-2">
    <Button onClick={csv} className="bg-transparent text-[var(--foreground)] border border-[var(--border)]"><Download size={16}/> CSV</Button>
    <Button onClick={() => setCreando(true)}><Plus size={16}/> Nuevo cliente</Button>
  </div>
  <ClientTable clientes={clientes} onSelect={setSelected}/>
  {selected && <ClientDrawer cliente={selected} mensajes={historial} onClose={()=>setSelected(null)} onEdit={() => { setEditando(selected); setSelected(null); }} onChanged={onSaved}/>}
  {(creando || editando) && <ClientForm cliente={editando ?? undefined} onClose={() => { setCreando(false); setEditando(null); }} onSaved={onSaved}/>}
 </>
}
