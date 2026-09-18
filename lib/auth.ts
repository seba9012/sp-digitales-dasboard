import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE = "sp_admin_session";

function token() {
  return createHash("sha256")
    .update(`${process.env.ADMIN_PASSWORD ?? ""}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex");
}

export async function isAuthenticated() {
  const store = await cookies();
  return store.get(COOKIE)?.value === token();
}

export function sessionCookie() {
  return {
    name: COOKIE,
    value: token(),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function clearSessionCookie() {
  return {
    name: COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function validPassword(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD) && password === process.env.ADMIN_PASSWORD;
}
