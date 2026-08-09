import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT count(*) FROM data_umat WHERE kk_encrypted IS NOT NULL AND length(kk_encrypted) < 50;`;
    
    // Convert BigInt to string so JSON.stringify doesn't break
    const unencryptedCount = result[0].count.toString();
    
    return NextResponse.json({ success: true, unencryptedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
