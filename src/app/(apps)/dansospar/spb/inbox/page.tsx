import { db as prisma } from "@/lib/db";
import { SpbTable } from "../spb-table";
import { getLingkunganRestriction, hasPermission } from "@/lib/auth/permissions";
import { Inbox } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SpbInboxPage() {
  const restriction = await getLingkunganRestriction();
  const whereClause = restriction.restricted
    ? { lingkunganId: restriction.lingkunganId }
    : {};

  const canWrite = await hasPermission("SPB_UPDATE");
  const canDelete = await hasPermission("SPB_DELETE");

  // Determine which statuses the current user can act on
  const canReviewPic = await hasPermission("REVIEW_SPB_PIC");
  const canApproveTpdsp = await hasPermission("APPROVE_SPB_TPDSP");
  const canApprovePastor = await hasPermission("APPROVE_SPB_PASTOR");
  const canRealize = await hasPermission("REALIZE_SPB");

  const actionableStatuses: string[] = [];
  if (canReviewPic) actionableStatuses.push("SUBMITTED");
  if (canApproveTpdsp) actionableStatuses.push("REVIEW_PIC");
  if (canApprovePastor) actionableStatuses.push("APPROVED_TPDSP");
  if (canRealize) actionableStatuses.push("APPROVED_PASTOR");

  if (actionableStatuses.length === 0) {
    // If the user has no approval permissions at all, redirect to SPB list
    redirect("/dansospar/spb");
  }

  const spbList = await prisma.spbRequest.findMany({
    where: {
      ...whereClause,
      status: { in: actionableStatuses }
    },
    include: {
      lingkungan: { select: { namaLingkungan: true } },
      intensiAccount: { select: { namaIntensi: true } },
      kpsData: { select: { namaKepalaKeluarga: true } },
      umkmData: { select: { namaUsaha: true, namaPemilik: true } },
      creator: { select: { name: true } },
      updater: { select: { name: true } }
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
      <div className="flex flex-col justify-between items-start gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Inbox className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Peti Masuk Persetujuan</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Halaman ini khusus menampilkan Surat Permohonan Bantuan (SPB) yang saat ini memerlukan peninjauan dan persetujuan (Approval) dari Anda.
        </p>
      </div>

      <SpbTable
        spbList={serializedList}
        canWrite={canWrite}
        canDelete={canDelete}
        actionableStatuses={actionableStatuses}
      />
    </div>
  );
}
