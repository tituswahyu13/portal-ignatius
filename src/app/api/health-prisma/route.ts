import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET() {
  try {
    const start = Date.now();
    const count = await prisma.user.count();
    const time = Date.now() - start;
    return NextResponse.json({ status: "success", count, timeMs: time });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message, stack: error.stack }, { status: 500 });
  }
}
