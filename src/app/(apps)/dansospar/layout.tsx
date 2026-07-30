import { ReactNode } from "react";
import { DanSosParSidebar } from "./dansospar-sidebar";
import { hasPermission, getCurrentUser, getLingkunganRestriction } from "@/lib/auth/permissions";
import { db as prisma } from "@/lib/db";
import { SpbStatus } from "@prisma/client";

export default async function DanSosParLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const userName = user?.name || "Pengguna";
  const roleName = user?.userRoles?.[0]?.role?.name || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  const canReadKps = await hasPermission("KPS_READ");
  const canReadUmkm = await hasPermission("UMKM_READ");
  const canReadSpb = await hasPermission("SPB_READ");
  const canManageSpbRutin = await hasPermission("SPB_RUTIN_MANAGE");
  const canReadKeuangan = (await hasPermission("INTENSI_READ")) || (await hasPermission("MUTASI_READ"));
  const canReadLaporanKeuangan = await hasPermission("LAPORAN_KEUANGAN_READ");

  const restriction = await getLingkunganRestriction();
  const whereClause: any = restriction.restricted
    ? { lingkunganId: restriction.lingkunganId }
    : {};

  const canReviewPic = await hasPermission("REVIEW_SPB_PIC");
  const canApproveTpdsp = await hasPermission("APPROVE_SPB_TPDSP");
  const canApprovePastor = await hasPermission("APPROVE_SPB_PASTOR");
  const canRealize = await hasPermission("REALIZE_SPB");

  const actionableStatuses: SpbStatus[] = [];
  if (canReviewPic) actionableStatuses.push(SpbStatus.SUBMITTED);
  if (canApproveTpdsp) actionableStatuses.push(SpbStatus.REVIEW_PIC);
  if (canApprovePastor) actionableStatuses.push(SpbStatus.APPROVED_TPDSP);
  if (canRealize) actionableStatuses.push(SpbStatus.APPROVED_PASTOR);

  let pendingApprovalCount = 0;
  if (actionableStatuses.length > 0) {
    pendingApprovalCount = await prisma.spbRequest.count({
      where: {
        ...whereClause,
        status: { in: actionableStatuses }
      }
    });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <DanSosParSidebar 
        canReadKps={canReadKps}
        canReadUmkm={canReadUmkm}
        canReadSpb={canReadSpb}
        canManageSpbRutin={canManageSpbRutin}
        canReadKeuangan={canReadKeuangan}
        canReadLaporanKeuangan={canReadLaporanKeuangan}
        userName={userName}
        roleName={roleName}
        initials={initials}
        pendingApprovalCount={pendingApprovalCount}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
