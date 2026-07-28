"use client";

import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { deleteSpbAction } from "./actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SpbTable({
  spbList,
  canWrite = false,
  canDelete = false,
  actionableStatuses = []
}: {
  spbList: any[];
  canWrite?: boolean;
  canDelete?: boolean;
  actionableStatuses?: string[];
}) {
  const [spbToDelete, setSpbToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!spbToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteSpbAction(BigInt(spbToDelete));
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Gagal menghapus SPB");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan saat menghapus SPB.");
    } finally {
      setIsDeleting(false);
      setSpbToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED": return <Badge variant="secondary">Diajukan</Badge>;
      case "REVIEW_PIC": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Disetujui Ketua PSE</Badge>;
      case "APPROVED_TPDSP": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Disetujui Ketua Dansospar</Badge>;
      case "APPROVED_PASTOR": return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui Pastor Paroki</Badge>;
      case "REJECTED": return <Badge variant="destructive">Ditolak</Badge>;
      case "REALIZED": return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Pencairan Dana</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Split list: actionable items on top
  const actionableList = spbList.filter(spb => actionableStatuses.includes(spb.status));
  const otherList = spbList.filter(spb => !actionableStatuses.includes(spb.status));

  const renderRow = (spb: any, highlight = false) => {
    const pemohon = spb.kpsData
      ? spb.kpsData.namaKepalaKeluarga
      : spb.umkmData
        ? spb.umkmData.namaUsaha
        : "-";

    return (
      <tr
        key={spb.id}
        className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${highlight ? "bg-primary/5" : ""}`}
        onClick={() => router.push(`/dansospar/spb/${spb.id}`)}
      >
        <td className="px-4 py-3 font-medium text-primary underline-offset-2 hover:underline">{spb.nomorSpb}</td>
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
        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dansospar/spb/${spb.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> Detail
                </Link>
              </DropdownMenuItem>

              {spb.status === "SUBMITTED" && canWrite && (
                <DropdownMenuItem asChild>
                  <Link href={`/dansospar/spb/${spb.id}/edit`} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
              )}

              {spb.status === "SUBMITTED" && canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => setSpbToDelete(spb.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    );
  };

  const tableHeader = (
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
  );

  return (
    <>
      {/* Section: Perlu Tindakan Anda */}
      {actionableList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-semibold">Perlu Tindakan Anda ({actionableList.length})</h3>
          </div>
          <div className="rounded-md border-2 border-amber-300/70 bg-card overflow-x-auto">
            <table className="w-full text-sm text-left">
              {tableHeader}
              <tbody>
                {actionableList.map((spb) => renderRow(spb, true))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Pengajuan Lainnya */}
      <div className="space-y-3">
        {actionableList.length > 0 && (
          <h3 className="text-base font-semibold text-muted-foreground">Pengajuan Lainnya ({otherList.length})</h3>
        )}
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm text-left">
            {tableHeader}
            <tbody>
              {otherList.length === 0 && actionableList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground">
                    Belum ada pengajuan SPB.
                  </td>
                </tr>
              ) : otherList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-muted-foreground">
                    Tidak ada pengajuan lainnya.
                  </td>
                </tr>
              ) : (
                otherList.map((spb) => renderRow(spb))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!spbToDelete} onOpenChange={(open) => !open && setSpbToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus SPB tersebut secara permanen beserta lampirannya dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
