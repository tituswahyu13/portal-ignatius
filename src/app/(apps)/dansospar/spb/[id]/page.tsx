import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpbStatusManager } from "./spb-status-manager";
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED": return <Badge variant="secondary">Diajukan</Badge>;
      case "REVIEW_PIC": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Review PIC</Badge>;
      case "APPROVED_TPDSP": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Disetujui TPDSP</Badge>;
      case "APPROVED_PASTOR": return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui Romo</Badge>;
      case "REJECTED": return <Badge variant="destructive">Ditolak</Badge>;
      case "REALIZED": return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Terealisasi</Badge>;
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
            <div className="flex justify-center mb-6">
              {getStatusBadge(spb.status)}
            </div>
            
            <SpbStatusManager spbId={spb.id.toString()} currentStatus={spb.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
