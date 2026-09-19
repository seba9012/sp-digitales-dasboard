import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";
import { Configuracion } from "@/lib/types";

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const patch = (await req.json()) as Partial<Configuracion>;
    const nueva = await getCRMRepository().updateConfiguracion(patch);
    return NextResponse.json(nueva);
  } catch (error) {
    return NextResponse.json({ error: "server_error", message: (error as Error).message }, { status: 500 });
  }
}
