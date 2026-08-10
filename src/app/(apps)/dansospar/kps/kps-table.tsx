"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { deleteKpsAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { EditKpsDialog } from "./edit-kps-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon } from "lucide-react";
import { KpsAnalysis } from "./kps-analysis";

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
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [lingkunganId, setLingkunganId] = useState(searchParams.get("lingkunganId") || "ALL");

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

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (lingkunganId && lingkunganId !== "ALL") params.set("lingkunganId", lingkunganId);
    
    router.push(`/dansospar/kps?${params.toString()}`);
  };

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  if (kpsData.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground text-sm">Belum ada data KPS terdaftar.</p>
      </div>
    );
  }

  const sortedData = [...kpsData].sort((a, b) => {
    const pctA = Number(a.persentaseKelayakan) || 0;
    const pctB = Number(b.persentaseKelayakan) || 0;
    const comparison = pctA - pctB;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama KK atau alamat..."
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

      <div className="border rounded-md">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lingkungan</TableHead>
            <TableHead>Kepala Keluarga</TableHead>
            <TableHead>NIK (Tersensor)</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 transition-colors" 
              onClick={handleSort}
            >
              <div className="flex items-center gap-1">
                Status Kelayakan
                <span className="text-xs text-muted-foreground">{sortDirection === "asc" ? "↑" : "↓"}</span>
              </div>
            </TableHead>
            <TableHead>Total Skor</TableHead>
            <TableHead className="text-center w-[120px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.lingkungan?.namaLingkungan || "Tidak diketahui"}</TableCell>
              <TableCell>{item.umat?.nama || "Tidak diketahui"}</TableCell>
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
                    <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
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
                          <span className="col-span-2 font-medium">{item.umat?.nama || "-"}</span>
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
                          <span className="col-span-2 font-medium">{item.umat?.noHp || "-"}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Pekerjaan</span>
                          <span className="col-span-2 font-medium">{item.umat?.pekerjaan || "-"}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Usia</span>
                          <span className="col-span-2 font-medium">
                            {item.umat?.tanggalLahir ? (() => {
                              const birthDate = new Date(item.umat.tanggalLahir);
                              const today = new Date();
                              let age = today.getFullYear() - birthDate.getFullYear();
                              const m = today.getMonth() - birthDate.getMonth();
                              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                              }
                              return `${age} Tahun`;
                            })() : "-"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 border-b pb-2">
                          <span className="font-semibold text-muted-foreground">Alamat</span>
                          <span className="col-span-2 font-medium">{item.umat?.alamat || "-"}</span>
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
                        <div className="pt-4 border-t">
                          <KpsAnalysis kps={item} />
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
    </div>
  );
}
