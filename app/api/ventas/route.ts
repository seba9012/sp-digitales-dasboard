import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { VentaRevendedor } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<VentaRevendedor>;
  if (!body.revendedor || !body.clienteFinal) {
    return NextResponse.json({ error: "Faltan revendedor y/o cliente final." }, { status: 400 });
  }
  const repo = getCRMRepository();
  if (!repo.createVenta) return NextResponse.json({ error: "No disponible con DATA_SOURCE actual." }, { status: 501 });
  try {
    const venta: VentaRevendedor = {
      fechaVenta: body.fechaVenta ?? "", revendedor: body.revendedor, clienteFinal: body.clienteFinal,
      plan: body.plan ?? "", monto: Number(body.monto) || 0, correo: body.correo ?? "", contrasena: body.contrasena ?? "",
      activacion: body.activacion ?? "", vencimiento: body.vencimiento ?? "", perfiles: body.perfiles ?? "",
      filaCuenta: body.filaCuenta ?? "", estado: body.estado ?? "ACTIVA", correoAnterior: body.correoAnterior ?? "",
    };
    const creada = await repo.createVenta(venta);
    return NextResponse.json(creada, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear la venta." }, { status: 400 });
  }
}
