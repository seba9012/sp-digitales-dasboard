"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { VentaRevendedor } from "@/lib/types";
import { Badge, Button, Card } from "./ui";
import { money, dateAR } from "@/lib/utils";
import { VentaForm } from "./venta-form";
import { VentaDrawer } from "./venta-drawer";

export function VentasClient({ ventas }: { ventas: VentaRevendedor[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<VentaRevendedor | null>(null);
  const revendedores = [...new Set(ventas.map(v => v.revendedor))].filter(Boolean);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreating(true)}><Plus size={16} /> Nueva venta</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="p-5"><h2 className="font-display text-lg font-medium">Ventas recientes</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs font-medium text-[var(--ink-dim)]">
              <tr className="border-b border-[var(--line)]">
                <th className="p-3 font-medium">Fecha</th>
                <th className="font-medium">Revendedor</th>
                <th className="font-medium">Cliente final</th>
                <th className="font-medium">Plan</th>
                <th className="font-medium">Monto</th>
                <th className="font-medium">Vencimiento</th>
                <th className="font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v, i) => (
                <tr key={i} onClick={() => setSelected(v)} className="cursor-pointer border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg-soft)]">
                  <td className="tabular p-3">{dateAR(v.fechaVenta)}</td>
                  <td>{v.revendedor}</td>
                  <td>{v.clienteFinal}</td>
                  <td>{v.plan}</td>
                  <td className="tabular">{money(v.monto)}</td>
                  <td className="tabular">{dateAR(v.vencimiento)}</td>
                  <td><Badge tone={v.estado === "ACTIVA" ? "success" : "danger"}>{v.estado}</Badge></td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--ink-dim)]">Todavía no hay ventas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && <VentaForm revendedores={revendedores} onClose={() => setCreating(false)} onCreated={() => router.refresh()} />}
      {selected && <VentaDrawer venta={selected} onClose={() => setSelected(null)} onChanged={() => router.refresh()} />}
    </>
  );
}
