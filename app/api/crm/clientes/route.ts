import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { Cliente } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as Partial<Cliente>;
    if (!body.whatsapp || !body.nombre) {
      return NextResponse.json({ error: "invalid_request", message: "Faltan whatsapp o nombre." }, { status: 400 });
    }
    const cliente: Cliente = {
      whatsapp: body.whatsapp, nombre: body.nombre, plan: body.plan ?? "", monto: Number(body.monto) || 0,
      estadoPago: body.estadoPago ?? "PENDIENTE DE VERIFICACIÓN", fechaCompra: body.fechaCompra ?? new Date().toISOString().slice(0,10),
      fechaActivacion: body.fechaActivacion ?? "", vencimiento: body.vencimiento ?? "", vigente: body.vigente ?? "NO",
      referenciaPago: body.referenciaPago ?? "", idMercadoPago: body.idMercadoPago ?? "", correo: body.correo ?? "",
      contrasena: body.contrasena ?? "", dni: body.dni ?? "", enviarCuenta: body.enviarCuenta ?? "SÍ",
    };
    const creado = await getCRMRepository().createCliente(cliente);
    return NextResponse.json(creado);
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as { whatsapp?: string; patch?: Partial<Cliente> };
    if (!body.whatsapp || !body.patch) {
      return NextResponse.json({ error: "invalid_request", message: "Faltan whatsapp o patch." }, { status: 400 });
    }
    const actualizado = await getCRMRepository().updateCliente(body.whatsapp, body.patch);
    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { whatsapp } = (await req.json()) as { whatsapp?: string };
    if (!whatsapp) return NextResponse.json({ error: "invalid_request", message: "Falta whatsapp." }, { status: 400 });
    await getCRMRepository().deleteCliente(whatsapp);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}
