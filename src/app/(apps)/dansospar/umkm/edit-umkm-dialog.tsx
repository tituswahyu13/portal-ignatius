"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUmkmAction, getKpsByLingkungan } from "./actions";
import { Edit2 } from "lucide-react";

export function EditUmkmDialog({ umkm, lingkungan }: { umkm: any, lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedLingkungan, setSelectedLingkungan] = useState<string>(umkm.lingkunganId?.toString() || "");
  const [kpsList, setKpsList] = useState<any[]>([]);
  const [isKps, setIsKps] = useState<boolean>(!!umkm.kpsId);

  // Load KPS when lingkungan changes
  useEffect(() => {
    if (!selectedLingkungan) {
      setKpsList([]);
      return;
    }

    const fetchKps = async () => {
      const data = await getKpsByLingkungan(parseInt(selectedLingkungan));
      setKpsList(data);
    };
    
    fetchKps();
  }, [selectedLingkungan]);

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
              <Select name="lingkunganId" required value={selectedLingkungan} onValueChange={setSelectedLingkungan}>
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

          <div className="space-y-4 border p-4 rounded-md bg-muted/20">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id={`isKps-edit-${umkm.id}`} 
                checked={isKps} 
                onChange={(e) => setIsKps(e.target.checked)} 
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor={`isKps-edit-${umkm.id}`} className="cursor-pointer">Pemilik adalah Keluarga Pra-Sejahtera (KPS)</Label>
            </div>
            
            {isKps ? (
              <div className="space-y-2">
                <Label>Pilih Data KPS (Berdasarkan Lingkungan)</Label>
                <Select name="kpsId" defaultValue={umkm.kpsId?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedLingkungan ? "Pilih Kepala Keluarga KPS" : "Pilih Lingkungan Dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {kpsList.length === 0 && selectedLingkungan ? (
                      <SelectItem value="none" disabled>Tidak ada data KPS</SelectItem>
                    ) : (
                      kpsList.map((k) => (
                        <SelectItem key={k.id} value={k.id.toString()}>{k.namaKepalaKeluarga}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Pilih Kepala Keluarga jika UMKM ini terikat dengan data KPS.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Nomor Induk Kependudukan (NIK)</Label>
                <Input name="nik" placeholder="Masukkan 16 digit NIK" maxLength={16} defaultValue={umkm.nik || ""} />
                <p className="text-xs text-muted-foreground">NIK akan dienkripsi dan disimpan dengan aman.</p>
              </div>
            )}
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
