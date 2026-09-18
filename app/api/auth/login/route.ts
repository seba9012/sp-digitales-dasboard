import { NextResponse } from "next/server";
import { sessionCookie, validPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // Compara directamente la contraseña ingresada con la tuya
    if (!validPassword(password) && password !== "sebastianperez2020") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    
    // Asigna la cookie de sesión para permitir el acceso al CRM
    const cookie = sessionCookie();
    res.cookies.set(cookie.name, cookie.value, cookie.options);

    return res;
  } catch (error) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
