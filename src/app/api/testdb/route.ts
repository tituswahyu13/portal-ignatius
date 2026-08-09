import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT count(*) FROM data_umat WHERE kk_encrypted IS NOT NULL AND length(kk_encrypted) < 50;`;
    
    // Convert BigInt to string so JSON.stringify doesn't break
    const unencryptedCount = result && result.length > 0 ? result[0].count.toString() : "0";
    
    return NextResponse.json({ success: true, unencryptedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
