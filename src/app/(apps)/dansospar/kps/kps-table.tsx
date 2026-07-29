"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { deleteKpsAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { EditKpsDialog } from "./edit-kps-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function KpsTable({ 
  kpsData, 
  lingkungan,
  canWrite = true,
  canDelete = true
}: { 
  kpsData: any[], 
  lingkungan: any[],
  canWrite?: boolean,
  canDelete?: boolean
}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data KPS ini?")) {
      setIsDeleting(id);
      try {
        await deleteKpsAction(id);
      } finally {
        setIsDeleting(null);
      }
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
          {kpsData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.lingkungan?.namaLingkungan || "Tidak diketahui"}</TableCell>
              <TableCell>{item.namaKepalaKeluarga}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.nikDecryptedMasked}</code>
              </TableCell>
              <TableCell>
                {item.statusKeluarga === "Prasejahtera" ? (
                  <Badge variant="destructive">Prasejahtera ({item.persentaseKelayakan}%)</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">Sejahtera ({item.persentaseKelayakan}%)</Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="font-semibold">{item.totalSkor}</span> / 21
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Detail Data KPS</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4 text-sm">
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Lingkungan</span>
                          <span className="col-span-2 font-medium">{item.lingkungan?.namaLingkungan}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Kepala Keluarga</span>
                          <span className="col-span-2 font-medium">{item.namaKepalaKeluarga}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">NIK</span>
                          <span className="col-span-2 font-mono bg-muted px-1 py-0.5 rounded">{item.nikDecryptedMasked}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">No. KK</span>
                          <span className="col-span-2 font-mono bg-muted px-1 py-0.5 rounded">{item.kkDecryptedMasked}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">No. HP</span>
                          <span className="col-span-2 font-medium">{item.noHp || "-"}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Pekerjaan</span>
                          <span className="col-span-2 font-medium">{item.pekerjaan || "-"}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Tgl Lahir</span>
                          <span className="col-span-2 font-medium">{item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString('id-ID') : "-"}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Alamat</span>
                          <span className="col-span-2 font-medium">{item.alamat}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Dibuat</span>
                          <span className="col-span-2 font-medium text-xs flex items-center">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : "-"}
                            {item.creator?.name && <span className="text-muted-foreground ml-1">oleh {item.creator.name}</span>}
                          </span>
                        </div>
                        {item.updatedAt && (
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Diperbarui</span>
                          <span className="col-span-2 font-medium text-xs flex items-center">
                            {new Date(item.updatedAt).toLocaleString('id-ID')}
                            {item.updater?.name && <span className="text-muted-foreground ml-1">oleh {item.updater.name}</span>}
                          </span>
                        </div>
                        )}
                        <div className="pt-2">
                          <p className="font-semibold mb-2">Penilaian Kelayakan:</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div className="flex justify-between"><span>Pekerjaan:</span> <span className="font-bold">{item.skorPekerjaan}</span></div>
                            <div className="flex justify-between"><span>Kesehatan:</span> <span className="font-bold">{item.skorKesehatan}</span></div>
                            <div className="flex justify-between"><span>Sandang:</span> <span className="font-bold">{item.skorSandang}</span></div>
                            <div className="flex justify-between"><span>Pendidikan:</span> <span className="font-bold">{item.skorPendidikan}</span></div>
                            <div className="flex justify-between"><span>Pangan:</span> <span className="font-bold">{item.skorPangan}</span></div>
                            <div className="flex justify-between"><span>Sosial:</span> <span className="font-bold">{item.skorSosial}</span></div>
                            <div className="flex justify-between"><span>Papan:</span> <span className="font-bold">{item.skorPapan}</span></div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {canWrite && <EditKpsDialog kps={item} lingkungan={lingkungan} />}
                  {canDelete && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={isDeleting === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {isDeleting === item.id ? "Menghapus..." : "Hapus"}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
