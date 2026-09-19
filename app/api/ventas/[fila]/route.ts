import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { VentaRevendedor } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ fila: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { fila } = await params;
  const patch = (await req.json()) as Partial<VentaRevendedor>;
  const repo = getCRMRepository();
  if (!repo.updateVenta) return NextResponse.json({ error: "No disponible con DATA_SOURCE actual." }, { status: 501 });
  try {
    const actualizada = await repo.updateVenta(Number(fila), patch);
    return NextResponse.json(actualizada);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar la venta." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ fila: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { fila } = await params;
  const repo = getCRMRepository();
  if (!repo.deleteVenta) return NextResponse.json({ error: "No disponible con DATA_SOURCE actual." }, { status: 501 });
  try {
    await repo.deleteVenta(Number(fila));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar la venta." }, { status: 400 });
  }
}
