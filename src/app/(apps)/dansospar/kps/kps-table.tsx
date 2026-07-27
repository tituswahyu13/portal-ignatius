"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteKpsAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { EditKpsDialog } from "./edit-kps-dialog";

export function KpsTable({ kpsData, lingkungan }: { kpsData: any[], lingkungan: any[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data KPS ini?")) {
      await deleteKpsAction(id);
    }
  };

  if (kpsData.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground text-sm">Belum ada data KPS terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lingkungan</TableHead>
            <TableHead>Kepala Keluarga</TableHead>
            <TableHead>NIK (Tersensor)</TableHead>
            <TableHead>Status Kelayakan</TableHead>
            <TableHead>Total Skor</TableHead>
            <TableHead className="w-[100px] text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpsData.map((kps) => (
            <TableRow key={kps.id}>
              <TableCell className="font-medium">{kps.lingkungan?.namaLingkungan || "Tidak diketahui"}</TableCell>
              <TableCell>{kps.namaKepalaKeluarga}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{kps.nikDecryptedMasked}</code>
              </TableCell>
              <TableCell>
                {kps.statusKeluarga === "Prasejahtera" ? (
                  <Badge variant="destructive">Prasejahtera ({kps.persentaseKelayakan}%)</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">Sejahtera ({kps.persentaseKelayakan}%)</Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="font-semibold">{kps.totalSkor}</span> / 21
              </TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                <EditKpsDialog kps={kps} lingkungan={lingkungan} />
                <Button variant="ghost" size="sm" onClick={() => handleDelete(kps.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
