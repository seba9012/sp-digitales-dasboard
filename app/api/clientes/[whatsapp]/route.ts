import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { Cliente } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ whatsapp: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { whatsapp } = await params;
  const patch = (await req.json()) as Partial<Cliente>;
  const repo = getCRMRepository();
  if (!repo.updateCliente) return NextResponse.json({ error: "No disponible con DATA_SOURCE actual." }, { status: 501 });
  try {
    const actualizado = await repo.updateCliente(decodeURIComponent(whatsapp), patch);
    return NextResponse.json(actualizado);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar el cliente." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ whatsapp: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { whatsapp } = await params;
  const repo = getCRMRepository();
  if (!repo.deleteCliente) return NextResponse.json({ error: "No disponible con DATA_SOURCE actual." }, { status: 501 });
  try {
    await repo.deleteCliente(decodeURIComponent(whatsapp));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al eliminar el cliente." }, { status: 400 });
  }
}
