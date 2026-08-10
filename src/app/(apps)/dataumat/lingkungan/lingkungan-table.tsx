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
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteLingkungan, deleteLingkunganBatch } from "./actions";
import { EditLingkunganDialog } from "./edit-lingkungan-dialog";
import { Loader2 } from "lucide-react";

interface LingkunganTableProps {
  lingkungans: {
    id: number;
    namaLingkungan: string;
    wilayah: string;
  }[];
}

export function LingkunganTable({ lingkungans }: LingkunganTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(lingkungans.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDeleteBatch = async () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} lingkungan terpilih?`)) {
      setIsDeleting(true);
      try {
        const result = await deleteLingkunganBatch(selectedIds);
        if (result.success) {
          alert("Berhasil menghapus data terpilih.");
          setSelectedIds([]);
        } else {
          alert("Gagal: " + result.message);
          setSelectedIds([]);
        }
      } catch (error) {
        alert("Gagal: Terjadi kesalahan sistem.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteSingle = async (id: number) => {
    if (confirm("Yakin ingin menghapus lingkungan ini?")) {
      try {
        const result = await deleteLingkungan(id);
        if (result.success) {
          // Success
        } else {
          alert("Gagal: " + result.message);
        }
      } catch (error) {
        alert("Gagal: Terjadi kesalahan sistem.");
      }
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-muted p-3 rounded-md">
          <span className="text-sm font-medium">{selectedIds.length} baris terpilih</span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteBatch} 
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Hapus Terpilih
          </Button>
        </div>
      )}
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox 
                  checked={selectedIds.length === lingkungans.length && lingkungans.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[80px] text-center">ID</TableHead>
              <TableHead>Nama Lingkungan</TableHead>
              <TableHead>Wilayah</TableHead>
              <TableHead className="w-[100px] text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lingkungans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Belum ada data lingkungan
                </TableCell>
              </TableRow>
            ) : (
              lingkungans.map((lingkungan) => (
                <TableRow key={lingkungan.id}>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedIds.includes(lingkungan.id)}
                      onCheckedChange={(checked) => handleSelect(lingkungan.id, checked as boolean)}
                      aria-label={`Select ${lingkungan.namaLingkungan}`}
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium">{lingkungan.id}</TableCell>
                  <TableCell>{lingkungan.namaLingkungan}</TableCell>
                  <TableCell>{lingkungan.wilayah}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <EditLingkunganDialog lingkungan={lingkungan} />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive" 
                        title="Hapus Lingkungan"
                        onClick={() => handleDeleteSingle(lingkungan.id)}
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
  );
}
