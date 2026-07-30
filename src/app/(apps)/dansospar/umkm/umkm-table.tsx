"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUmkmAction } from "./actions";
import { formatRupiah } from "@/lib/utils";
import { EditUmkmDialog } from "./edit-umkm-dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon } from "lucide-react";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [lingkunganId, setLingkunganId] = useState(searchParams.get("lingkunganId") || "ALL");

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

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (lingkunganId && lingkunganId !== "ALL") params.set("lingkunganId", lingkunganId);
    
    router.push(`/dansospar/umkm?${params.toString()}`);
  };

  const formatCurrency = (value: string) => {
    return formatRupiah(Number(value));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama usaha atau pemilik..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>
        <div className="w-full sm:w-[250px]">
          <Select value={lingkunganId} onValueChange={setLingkunganId}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Lingkungan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Lingkungan</SelectItem>
              {lingkungan.map((ling) => (
                <SelectItem key={ling.id} value={ling.id.toString()}>{ling.namaLingkungan}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleFilter} className="w-full sm:w-auto">
          Filter
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Usaha / Pemilik</TableHead>
            <TableHead>Lingkungan</TableHead>
            <TableHead>Aset & Omset</TableHead>
            <TableHead>Kelayakan</TableHead>
            <TableHead>Jejak Audit</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {umkmData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                  <div className="text-[10px] text-muted-foreground">
                    <div>Buat: {umkm.createdAt ? new Date(umkm.createdAt).toLocaleDateString('id-ID') : "-"}</div>
                    {umkm.creator?.name && <div className="font-medium">{umkm.creator.name}</div>}
                    
                    {umkm.updatedAt && (
                      <div className="mt-1">
                        <div>Ubah: {new Date(umkm.updatedAt).toLocaleDateString('id-ID')}</div>
                        {umkm.updater?.name && <div className="font-medium">{umkm.updater.name}</div>}
                      </div>
                    )}
                  </div>
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
    </div>
  );
}
