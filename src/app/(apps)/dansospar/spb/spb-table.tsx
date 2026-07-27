import { db as prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { updateSpbStatusAction } from "./actions";

export function SpbTable({ spbList }: { spbList: any[] }) {
  
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
    <div className="rounded-md border bg-card overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
          <tr>
            <th className="px-4 py-3">Nomor SPB</th>
            <th className="px-4 py-3">Tgl Pengajuan</th>
            <th className="px-4 py-3">Subjek (Pemohon)</th>
            <th className="px-4 py-3">Lingkungan</th>
            <th className="px-4 py-3">Kategori & Akun</th>
            <th className="px-4 py-3 text-right">Dana Paroki</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {spbList.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-10 text-muted-foreground">
                Belum ada pengajuan SPB.
              </td>
            </tr>
          ) : (
            spbList.map((spb) => {
              const pemohon = spb.kpsData 
                ? spb.kpsData.namaKepalaKeluarga 
                : spb.umkmData 
                  ? spb.umkmData.namaUsaha 
                  : "-";
              
              const isRealized = spb.status === "REALIZED";

              return (
                <tr key={spb.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{spb.nomorSpb}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(spb.submittedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 font-semibold">{pemohon}</td>
                  <td className="px-4 py-3">{spb.lingkungan.namaLingkungan}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{spb.kategoriBantuan}</div>
                    <div className="text-xs text-muted-foreground">{spb.intensiAccount.namaIntensi}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {formatRupiah(parseFloat(spb.danaParokiRequested))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(spb.status)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dansospar/spb/${spb.id}`}>
                        <Eye className="h-4 w-4 mr-1" /> Detail
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
