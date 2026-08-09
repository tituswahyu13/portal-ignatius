import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nullCount = await prisma.dataUmat.count({
      where: { lingkunganId: null }
    });
    return NextResponse.json({ success: true, nullCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
