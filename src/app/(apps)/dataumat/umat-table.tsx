"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteDataUmat } from "./actions";
import { EditUmatDialog } from "./edit-umat-dialog";

interface UmatTableProps {
  dataUmatList: any[];
  lingkungans: { id: number; namaLingkungan: string }[];
  isRestricted: boolean;
  userLingkunganId: number | null;
}

export function UmatTable({ dataUmatList, lingkungans, isRestricted, userLingkunganId }: UmatTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLingkungan, setFilterLingkungan] = useState<string>("all");

  const [sortField, setSortField] = useState<"nama" | "lingkungan">("nama");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "nama" | "lingkungan") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredData = dataUmatList.filter((umat) => {
    const matchesSearch = umat.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (umat.namaBaptis && umat.namaBaptis.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (isRestricted) {
      return matchesSearch;
    }

    if (filterLingkungan === "all") {
      return matchesSearch;
    }

    return matchesSearch && umat.lingkunganId.toString() === filterLingkungan;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    if (sortField === "nama") {
      comparison = a.nama.localeCompare(b.nama);
    } else if (sortField === "lingkungan") {
      comparison = (a.namaLingkungan || "").localeCompare(b.namaLingkungan || "");
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus data umat ini?")) {
      const result = await deleteDataUmat(id);
      if (!result.success) {
        alert("Gagal menghapus: " + result.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama umat..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {!isRestricted && (
          <div className="w-full sm:w-[250px]">
            <Select value={filterLingkungan} onValueChange={setFilterLingkungan}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Lingkungan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lingkungan</SelectItem>
                {lingkungans.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.namaLingkungan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors" 
                  onClick={() => handleSort("nama")}
                >
                  <div className="flex items-center gap-1">
                    Nama Umat
                    {sortField === "nama" && (
                      <span className="text-xs text-muted-foreground">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors" 
                  onClick={() => handleSort("lingkungan")}
                >
                  <div className="flex items-center gap-1">
                    Lingkungan
                    {sortField === "lingkungan" && (
                      <span className="text-xs text-muted-foreground">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Pekerjaan</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead className="w-[100px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Tidak ada data yang cocok
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((umat) => (
                  <TableRow key={umat.id}>
                    <TableCell className="font-medium">
                      {umat.nama}
                      {umat.namaBaptis && <span className="block text-xs text-muted-foreground">{umat.namaBaptis}</span>}
                    </TableCell>
                    <TableCell>{umat.namaLingkungan}</TableCell>
                    <TableCell>
                      {umat.pekerjaan || "-"}
                      {umat.profesi && <span className="block text-xs text-muted-foreground">{umat.profesi}</span>}
                    </TableCell>
                    <TableCell>{umat.noHp || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <EditUmatDialog 
                          umat={umat}
                          lingkungans={lingkungans}
                          isRestricted={isRestricted}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          title="Hapus Data"
                          onClick={() => handleDelete(umat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
