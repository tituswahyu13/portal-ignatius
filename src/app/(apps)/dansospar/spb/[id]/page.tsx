import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpbStatusManager } from "./spb-status-manager";
import { hasPermission } from "@/lib/auth/permissions";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SpbDetailPage({ params }: { params: { id: string } }) {
  const spbId = BigInt(params.id);

  const spb = await prisma.spbRequest.findUnique({
    where: { id: spbId },
    include: {
      lingkungan: true,
      intensiAccount: true,
      kpsData: true,
      umkmData: true,
      creator: true,
      attachments: true
    }
  });

  if (!spb) {
    notFound();
  }

  const pemohon = spb.kpsData
    ? spb.kpsData.namaKepalaKeluarga
    : spb.umkmData
      ? `${spb.umkmData.namaUsaha} (${spb.umkmData.namaPemilik})`
      : "-";

  const canReviewPic = await hasPermission("REVIEW_SPB_PIC");
  const canApproveTpdsp = await hasPermission("APPROVE_SPB_TPDSP");
  const canApprovePastor = await hasPermission("APPROVE_SPB_PASTOR");
  const canRealize = await hasPermission("REALIZE_SPB");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED": return <Badge variant="secondary">Diajukan</Badge>;
      case "REVIEW_PIC": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Disetujui Ketua PSE</Badge>;
      case "APPROVED_TPDSP": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Disetujui Ketua Dansospar</Badge>;
      case "APPROVED_PASTOR": return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui Pastor Paroki</Badge>;
      case "REJECTED": return <Badge variant="destructive">Ditolak</Badge>;
      case "REALIZED": return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Selesai</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dansospar/spb">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Detail Pengajuan: {spb.nomorSpb}</h2>
          <p className="text-muted-foreground">
            Diajukan pada: {new Date(spb.submittedAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Informasi Subjek & Bantuan</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <div className="text-muted-foreground">Pemohon</div>
                <div className="font-semibold">{pemohon}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Lingkungan</div>
                <div className="font-semibold">{spb.lingkungan.namaLingkungan}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Kategori Bantuan</div>
                <div className="font-semibold">{spb.kategoriBantuan}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sumber Dana Intensi</div>
                <div className="font-semibold">{spb.intensiAccount.namaIntensi}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Keaktifan Umat</div>
                <div className="font-semibold">{spb.keaktifanUmat || "-"}</div>
              </div>
              <div className="col-span-2 mt-2">
                <div className="text-muted-foreground">Alasan Bantuan</div>
                <div className="font-medium p-3 bg-muted/30 rounded-md border text-sm italic mt-1">
                  "{spb.alasanBantuan || "Tidak ada alasan yang dicantumkan"}"
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Rincian Finansial</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Kebutuhan Biaya</span>
                <span className="font-medium">{formatRupiah(parseFloat(spb.totalBiaya.toString()))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dana Swadaya</span>
                <span className="font-medium text-red-500">- {formatRupiah(parseFloat(spb.danaSwadaya.toString()))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dana Kas Lingkungan</span>
                <span className="font-medium text-red-500">- {formatRupiah(parseFloat(spb.danaLingkungan.toString()))}</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center font-bold text-base">
                <span>Total Dana Diajukan ke Paroki</span>
                <span className="text-primary">{formatRupiah(parseFloat(spb.danaParokiRequested.toString()))}</span>
              </div>
              {spb.danaParokiApproved !== null && (
                <div className="pt-3 border-t flex justify-between items-center font-bold text-base text-green-700">
                  <span>Dana Paroki Disetujui TPDSP</span>
                  <span>{formatRupiah(parseFloat(spb.danaParokiApproved.toString()))}</span>
                </div>
              )}
              {spb.rekomendasiKevikepan && (
                <div className="pt-2 flex justify-between items-center text-sm font-medium text-amber-600">
                  <span>Rekomendasi ke Kevikepan</span>
                  <span>Ya (Direkomendasikan)</span>
                </div>
              )}
            </div>
          </div>

          {spb.attachments.length > 0 && (
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Lampiran (Google Drive)</h3>
              <div className="space-y-2">
                {spb.attachments.map((file) => (
                  <div key={file.id.toString()} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">Dokumen SPB (PDF)</div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://drive.google.com/file/d/${file.googleDriveFileId}/view`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" /> Buka File
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Status Pengajuan</h3>
            <div className="flex flex-col items-center justify-center mb-6 gap-3">
              {getStatusBadge(spb.status)}
              {spb.status === "REJECTED" && spb.rejectionReason && (
                <div className="text-sm bg-red-50 text-red-700 p-3 rounded-md w-full border border-red-100 text-center">
                  <span className="font-semibold block mb-1">Alasan Penolakan:</span>
                  {spb.rejectionReason}
                </div>
              )}
            </div>

            <SpbStatusManager
              spbId={spb.id.toString()}
              currentStatus={spb.status}
              canReviewPic={canReviewPic}
              canApproveTpdsp={canApproveTpdsp}
              canApprovePastor={canApprovePastor}
              canRealize={canRealize}
              danaRequested={parseFloat(spb.danaParokiRequested.toString())}
              danaApproved={spb.danaParokiApproved ? parseFloat(spb.danaParokiApproved.toString()) : undefined}
              initialRekomendasi={spb.rekomendasiKevikepan}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
