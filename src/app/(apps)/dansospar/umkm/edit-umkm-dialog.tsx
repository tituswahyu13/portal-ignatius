"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUmkmAction } from "./actions";
import { Edit2 } from "lucide-react";

export function EditUmkmDialog({ umkm, lingkungan }: { umkm: any, lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateUmkmAction(umkm.id, formData);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Gagal memperbarui data");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Edit UMKM">
          <Edit2 className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ubah Data UMKM</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Pemilik</Label>
              <Input name="namaPemilik" required defaultValue={umkm.namaPemilik} />
            </div>
            <div className="space-y-2">
              <Label>Lingkungan</Label>
              <Select name="lingkunganId" required defaultValue={umkm.lingkunganId?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lingkungan" />
                </SelectTrigger>
                <SelectContent>
                  {lingkungan.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.namaLingkungan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Usaha</Label>
              <Input name="namaUsaha" required defaultValue={umkm.namaUsaha} />
            </div>
            <div className="space-y-2">
              <Label>Jenis Usaha</Label>
              <Input name="jenisUsaha" defaultValue={umkm.jenisUsaha} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Aset (Rp)</Label>
              <Input type="number" name="asetTotal" defaultValue={umkm.asetTotal} />
            </div>
            <div className="space-y-2">
              <Label>Omset Tahunan (Rp)</Label>
              <Input type="number" name="omsetTahunan" defaultValue={umkm.omsetTahunan} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>NIB (opsional)</Label>
            <Input name="nib" defaultValue={umkm.nib || ""} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
