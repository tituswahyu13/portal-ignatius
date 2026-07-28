"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUmkmAction } from "./actions";
import { formatRupiah } from "@/lib/utils";
import { EditUmkmDialog } from "./edit-umkm-dialog";

export function UmkmTable({ 
  umkmData, 
  lingkungan,
  canWrite = true,
  canDelete = true
}: { 
  umkmData: any[], 
  lingkungan: any[],
  canWrite?: boolean,
  canDelete?: boolean
}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data UMKM ini?")) {
      setIsDeleting(id);
      try {
        await deleteUmkmAction(id);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(value));
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Usaha / Pemilik</TableHead>
            <TableHead>Lingkungan</TableHead>
            <TableHead>Aset & Omset</TableHead>
            <TableHead>Kelayakan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {umkmData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Belum ada data UMKM.
              </TableCell>
            </TableRow>
          ) : (
            umkmData.map((umkm) => (
              <TableRow key={umkm.id}>
                <TableCell>
                  <div className="font-medium">{umkm.namaUsaha}</div>
                  <div className="text-xs text-muted-foreground">Oleh: {umkm.namaPemilik}</div>
                  {umkm.kpsData ? (
                    <div className="text-xs text-blue-600 font-medium mt-1">✓ KPS Terhubung</div>
                  ) : umkm.nik ? (
                    <div className="text-xs text-muted-foreground mt-1">NIK: {umkm.nik.substring(0, 6)}**********</div>
                  ) : null}
                </TableCell>
                <TableCell>{umkm.lingkungan?.namaLingkungan}</TableCell>
                <TableCell>
                  <div className="text-xs">Aset: {formatCurrency(umkm.asetTotal)}</div>
                  <div className="text-xs">Omset: {formatCurrency(umkm.omsetTahunan)}/thn</div>
                </TableCell>
                <TableCell>
                  {umkm.statusKelayakan ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">Memenuhi Syarat</Badge>
                  ) : (
                    <Badge variant="destructive">Melebihi Batas</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {canWrite && <EditUmkmDialog umkm={umkm} lingkungan={lingkungan} />}
                    {canDelete && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        disabled={isDeleting === umkm.id}
                        onClick={() => handleDelete(umkm.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeleting === umkm.id ? "Menghapus..." : "Hapus"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
