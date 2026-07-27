import { db as prisma } from "@/lib/db";
import { SpbTable } from "./spb-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SpbManagementPage() {
  const spbList = await prisma.spbRequest.findMany({
    include: {
      lingkungan: { select: { namaLingkungan: true } },
      intensiAccount: { select: { namaIntensi: true } },
      kpsData: { select: { namaKepalaKeluarga: true } },
      umkmData: { select: { namaUsaha: true, namaPemilik: true } }
    },
    orderBy: { submittedAt: 'desc' }
  });

  const serializedList = spbList.map(spb => ({
    ...spb,
    id: spb.id.toString(),
    kpsId: spb.kpsId?.toString(),
    umkmId: spb.umkmId?.toString(),
    totalBiaya: spb.totalBiaya.toString(),
    danaSwadaya: spb.danaSwadaya.toString(),
    danaLingkungan: spb.danaLingkungan.toString(),
    danaParokiRequested: spb.danaParokiRequested.toString(),
    danaKevikepanRequested: spb.danaKevikepanRequested.toString(),
    createdBy: spb.createdBy.toString()
  }));

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Pengajuan SPB</h2>
          <p className="text-muted-foreground">
            Daftar Surat Permohonan Bantuan yang diajukan oleh Lingkungan.
          </p>
        </div>
        <Button asChild>
          <Link href="/dansospar/spb/create">
            <Plus className="mr-2 h-4 w-4" />
            Buat Pengajuan Baru
          </Link>
        </Button>
      </div>

      <SpbTable spbList={serializedList} />
    </div>
  );
}
