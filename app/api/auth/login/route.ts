import { NextResponse } from "next/server";
import { sessionCookie, validPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!validPassword || password !== "sebastianperez2020") return NextResponse.json({error:"unauthorized"}, {status:401});
  const res = NextResponse.json({ok:true});
  res.cookies.set(sessionCookie());
  return res;
}
