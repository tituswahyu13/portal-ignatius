"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateKpsAction } from "./actions";
import { Edit2 } from "lucide-react";

const INDICATORS = [
  { name: "skorPekerjaan", label: "1. Pekerjaan & Pemasukan", desc1: "Serabutan, tidak menentu", desc2: "Pemasukan rutin bulanan ada, pas-pasan", desc3: "Pemasukan stabil, menabung rutin" },
  { name: "skorSandang", label: "2. Sandang (Pakaian)", desc1: "Sangat terbatas, lusuh, donasi", desc2: "Mampu beli pakaian baru pada momen tertentu", desc3: "Sangat baik, mampu kapan saja" },
  { name: "skorPangan", label: "3. Kebutuhan Pangan", desc1: "Hanya mampu 1-2 kali sehari", desc2: "Makan 3x sehari, menu seadanya", desc3: "Sangat terjamin dan bergizi seimbang" },
  { name: "skorPapan", label: "4. Tempat Tinggal", desc1: "Menumpang, tidak layak, terancam digusur", desc2: "Rumah warisan/kontrak layak", desc3: "Rumah milik pribadi sah dan layak huni" },
  { name: "skorKesehatan", label: "5. Kesehatan", desc1: "Sakit kronis, tidak ada BPJS", desc2: "BPJS PBI/Kelas 3, fisik sehat", desc3: "Proteksi baik (Kelas 1/2/Asuransi)" },
  { name: "skorPendidikan", label: "6. Pendidikan", desc1: "Menunggak, terancam putus sekolah", desc2: "Lancar, namun kesulitan uang buku", desc3: "Lancar tanpa kendala finansial" },
  { name: "skorSosial", label: "7. Sosial Komunitas", desc1: "Tidak pernah mampu bayar iuran", desc2: "Kadang-kadang membayar iuran", desc3: "Rutin iuran dan aktif donatur" }
];

export function EditKpsDialog({ kps, lingkungan }: { kps: any, lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateKpsAction(kps.id, formData);

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
        <Button variant="ghost" size="sm" title="Edit KPS">
          <Edit2 className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ubah Data KPS</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Kepala Keluarga</Label>
              <Input name="namaKepalaKeluarga" required defaultValue={kps.namaKepalaKeluarga} />
            </div>
            <div className="space-y-2">
              <Label>Lingkungan</Label>
              <Select name="lingkunganId" required defaultValue={kps.lingkunganId?.toString()}>
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
              <Label>NIK (Biarkan jika tidak diubah)</Label>
              <Input name="nik" placeholder="Masukkan 16 digit NIK baru" defaultValue={kps.nikDecryptedMasked || ""} />
              <p className="text-xs text-muted-foreground">Ketik ulang 16 digit jika ingin mengubah NIK.</p>
            </div>
            <div className="space-y-2">
              <Label>No. KK (Biarkan jika tidak diubah)</Label>
              <Input name="kk" placeholder="Masukkan 16 digit KK baru" defaultValue={kps.kkDecryptedMasked || ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nomor HP/WA (Opsional)</Label>
              <Input name="noHp" placeholder="0812xxxxxx" defaultValue={kps.noHp || ""} />
            </div>
            <div className="space-y-2">
              <Label>Pekerjaan Utama</Label>
              <Input name="pekerjaan" placeholder="Contoh: Buruh Harian" defaultValue={kps.pekerjaan || ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              {/* Note: Ensure kps.tanggalLahir is parsed correctly if it exists (e.g. YYYY-MM-DD format) */}
              <Input 
                name="tanggalLahir" 
                type="date" 
                defaultValue={kps.tanggalLahir ? new Date(kps.tanggalLahir).toISOString().split('T')[0] : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <Input name="alamat" required defaultValue={kps.alamat} />
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-4 bg-muted/20">
            <div className="mb-4">
              <h4 className="font-semibold text-sm">Evaluasi Kelayakan (Skor 1-3)</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INDICATORS.map((indicator) => (
                <div key={indicator.name} className="space-y-2 bg-background p-3 rounded-md border">
                  <Label className="font-semibold text-xs">{indicator.label}</Label>
                  <Select name={indicator.name} defaultValue={kps[indicator.name]?.toString() || "0"}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Pilih Skor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">N/A (Tidak Relevan)</SelectItem>
                      <SelectItem value="1">Skor 1 (Rentan)</SelectItem>
                      <SelectItem value="2">Skor 2 (Menengah)</SelectItem>
                      <SelectItem value="3">Skor 3 (Mandiri)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
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
