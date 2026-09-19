import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { Conocimiento } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as Partial<Conocimiento>;
    if (!body.titulo || !body.contenido) {
      return NextResponse.json({ error: "invalid_request", message: "Faltan título o contenido." }, { status: 400 });
    }
    const item: Conocimiento = {
      id: "", categoria: body.categoria ?? "General", titulo: body.titulo, contenido: body.contenido,
      activo: body.activo ?? "SÍ", actualizado: "",
    };
    const creado = await getCRMRepository().createConocimiento(item);
    return NextResponse.json(creado);
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as { id?: string; patch?: Partial<Conocimiento> };
    if (!body.id || !body.patch) {
      return NextResponse.json({ error: "invalid_request", message: "Faltan id o patch." }, { status: 400 });
    }
    const actualizado = await getCRMRepository().updateConocimiento(body.id, body.patch);
    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: "invalid_request", message: "Falta id." }, { status: 400 });
    await getCRMRepository().deleteConocimiento(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}
