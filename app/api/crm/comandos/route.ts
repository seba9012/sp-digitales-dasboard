import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { tipo } = (await req.json()) as { tipo?: string };
    if (!tipo) return NextResponse.json({ error: "invalid_request", message: "Falta tipo." }, { status: 400 });
    const comando = await getCRMRepository().crearComando(tipo);
    return NextResponse.json(comando);
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}
