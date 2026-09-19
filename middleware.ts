import { NextRequest, NextResponse } from "next/server";

async function expectedToken() {
  const raw = `${process.env.ADMIN_PASSWORD ?? ""}:${process.env.AUTH_SECRET ?? ""}`;
  const bytes = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/login")) return NextResponse.next();

  const session = req.cookies.get("sp_admin_session")?.value;
  const expected = await expectedToken();

  if (!session || session !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
