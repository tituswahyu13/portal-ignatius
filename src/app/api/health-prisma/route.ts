import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const timeMs = Date.now() - start;
    return NextResponse.json({ status: "ok", timeMs });
  } catch (error: any) {
    console.error("[HEALTH_CHECK_ERROR]", error);
    return NextResponse.json({ status: "unhealthy" }, { status: 500 });
  }
}
