import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { Cliente } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Cliente>;
  if (!body.whatsapp || !body.nombre) {
    return NextResponse.json({ error: "Faltan whatsapp y/o nombre." }, { status: 400 });
  }
  const repo = getCRMRepository();
  if (!repo.createCliente) return NextResponse.json({ error: "No disponible con DATA_SOURCE actual." }, { status: 501 });
  try {
    const cliente: Cliente = {
      whatsapp: body.whatsapp, nombre: body.nombre, plan: body.plan ?? "", monto: Number(body.monto) || 0,
      estadoPago: body.estadoPago ?? "PENDIENTE DE VERIFICACIÓN", fechaCompra: body.fechaCompra ?? "",
      fechaActivacion: body.fechaActivacion ?? "", vencimiento: body.vencimiento ?? "", vigente: body.vigente ?? "NO",
      referenciaPago: body.referenciaPago ?? "", idMercadoPago: body.idMercadoPago ?? "", correo: body.correo ?? "",
      contrasena: body.contrasena ?? "", dni: body.dni ?? "", enviarCuenta: body.enviarCuenta ?? "",
    };
    const creado = await repo.createCliente(cliente);
    return NextResponse.json(creado, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear el cliente." }, { status: 400 });
  }
}
