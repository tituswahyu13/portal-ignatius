"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUmkmAction } from "./actions";

export function CreateUmkmDialog({ lingkungan }: { lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createUmkmAction(formData);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Gagal menyimpan data");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Data UMKM</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pendaftaran UMKM</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Nama Pemilik</Label>
            <Input name="namaPemilik" required placeholder="Sesuai KTP" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pilih Lingkungan</Label>
              <Select name="lingkunganId" required>
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
            <div className="space-y-2">
              <Label>Nomor Induk Berusaha (NIB)</Label>
              <Input name="nib" placeholder="Opsional jika ada" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Usaha</Label>
              <Input name="namaUsaha" required placeholder="Cth: Warung Tegal" />
            </div>
            <div className="space-y-2">
              <Label>Jenis Usaha</Label>
              <Input name="jenisUsaha" placeholder="Cth: Kuliner" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
            <div className="space-y-2 col-span-2">
              <h4 className="font-semibold text-sm">Evaluasi Kelayakan</h4>
              <p className="text-xs text-muted-foreground">Otomatis layak jika Aset ≤ Rp 20.000.000 dan Omset Tahunan ≤ Rp 100.000.000</p>
            </div>
            <div className="space-y-2">
              <Label>Total Aset (Rp)</Label>
              <Input type="number" name="asetTotal" required placeholder="Misal: 5000000" min="0" />
            </div>
            <div className="space-y-2">
              <Label>Omset Tahunan (Rp)</Label>
              <Input type="number" name="omsetTahunan" required placeholder="Misal: 30000000" min="0" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Data UMKM"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
