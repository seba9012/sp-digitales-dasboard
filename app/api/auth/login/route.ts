import { NextResponse } from "next/server";
import { sessionCookie, validPassword } from "@/lib/auth";

export async function POST(req: Request) {
  // Sin ADMIN_PASSWORD nadie puede entrar: lo avisamos en vez de fingir "contraseña incorrecta".
  if (!process.env.ADMIN_PASSWORD) {
    console.error("[login] Falta la variable de entorno ADMIN_PASSWORD");
    return NextResponse.json(
      { error: "server_misconfigured", message: "Falta configurar ADMIN_PASSWORD en el servidor." },
      { status: 500 },
    );
  }

  try {
    const { password } = await req.json();

    // Se valida SOLO contra ADMIN_PASSWORD (variable de entorno), nunca contra un valor en el código.
    if (typeof password !== "string" || !validPassword(password)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    // Cookie "Secure" solo si la conexión es HTTPS; si no, el navegador la descarta
    // (pasa con `next start` por http o desde el celular por IP local) y el login "no hace nada".
    const https =
      new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    res.cookies.set({ ...sessionCookie(), secure: https });
    return res;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
