import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCRMRepository } from "@/lib/data";

export async function GET(){
  if(!(await isAuthenticated())) return NextResponse.json({error:"unauthorized"},{status:401});
  const data=await getCRMRepository().getAll();
  return NextResponse.json(data,{headers:{"Cache-Control":"private, max-age=30, stale-while-revalidate=60"}});
}