"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createKpsAction } from "./actions";

const INDICATORS = [
  { 
    name: "skorPekerjaan", 
    label: "1. Pekerjaan & Pemasukan",
    desc1: "Serabutan, tidak menentu, atau bergantung belas kasihan orang lain.",
    desc2: "Pemasukan rutin bulanan ada, namun pas-pasan (habis untuk bulanan).",
    desc3: "Pemasukan stabil/punya usaha berjalan, mampu menabung rutin."
  },
  { 
    name: "skorSandang", 
    label: "2. Sandang (Pakaian)",
    desc1: "Kesulitan membeli pakaian baru, baju yang dimiliki sangat terbatas, lusuh, atau mengandalkan donasi/pemberian baju bekas layak pakai.",
    desc2: "Mampu membeli pakaian baru hanya pada momen tertentu, sisanya menggunakan pakaian yang ada secara hemat.",
    desc3: "Kebutuhan sandang terpenuhi dengan sangat baik, mampu membeli pakaian baru kapan saja."
  },
  { 
    name: "skorPangan", 
    label: "3. Kebutuhan Pangan",
    desc1: "Sering kesulitan makan harian (hanya mampu 1-2 kali sehari).",
    desc2: "Makan 3 kali sehari terpenuhi, namun menu seadanya (rendah gizi).",
    desc3: "Kebutuhan pangan harian sangat terjamin dan bergizi seimbang."
  },
  { 
    name: "skorPapan", 
    label: "4. Tempat Tinggal",
    desc1: "Menumpang di tempat kerabat, tidak layak huni, atau terancam digusur.",
    desc2: "Tinggal di rumah warisan bersama (belum dibagi) atau kontrak/kos layak.",
    desc3: "Rumah milik pribadi yang sah (sertifikat sendiri) dan layak huni."
  },
  { 
    name: "skorKesehatan", 
    label: "5. Kesehatan",
    desc1: "Ada sakit kronis/lansia rentan, tidak ada jaminan/BPJS, obat tersendat.",
    desc2: "Memiliki BPJS aktif (PBI/Mandiri Kelas 3), kondisi fisik umum sehat.",
    desc3: "Punya proteksi kesehatan yang baik (BPJS Kelas 1/2 atau asuransi swasta)."
  },
  { 
    name: "skorPendidikan", 
    label: "6. Pendidikan",
    desc1: "Anak menunggak biaya sekolah, terancam putus sekolah/kuliah karena biaya.",
    desc2: "Anak bersekolah lancar, namun sering kesulitan saat bayar uang ujian/buku.",
    desc3: "Seluruh biaya sekolah/kuliah anak terbayar lancar tanpa kendala finansial."
  },
  { 
    name: "skorSosial", 
    label: "7. Sosial Komunitas",
    desc1: "Tidak pernah mampu membayar iuran lingkungan karena faktor ekonomi.",
    desc2: "Kadang-kadang membayar iuran jika ada dana lebih di dompet.",
    desc3: "Rutin membayar iuran lingkungan, kolekte, dan aktif menjadi donatur aksi sosial."
  }
];

export function CreateKpsDialog({ lingkungan }: { lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createKpsAction(formData);

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
        <Button>Tambah Data KPS</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pendaftaran Keluarga Pra-Sejahtera (KPS)</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Kepala Keluarga</Label>
              <Input name="namaKepalaKeluarga" required placeholder="Sesuai KTP" />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NIK (Nomor Induk Kependudukan)</Label>
              <Input name="nik" required placeholder="16 Digit NIK" maxLength={16} />
              <p className="text-xs text-muted-foreground">NIK akan dienkripsi (AES-256).</p>
            </div>
            <div className="space-y-2">
              <Label>Nomor Kartu Keluarga (KK)</Label>
              <Input name="kk" required placeholder="16 Digit No. KK" maxLength={16} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            <Input name="alamat" required placeholder="Alamat domisili saat ini" />
          </div>

          <div className="border rounded-md p-4 space-y-4 bg-muted/20">
            <div className="mb-4">
              <h4 className="font-semibold text-sm">Evaluasi Kelayakan (Skor 1-3)</h4>
              <p className="text-xs text-muted-foreground">
                Pilih opsi N/A (Skor 0) jika indikator tidak relevan dengan kondisi keluarga.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INDICATORS.map((indicator) => (
                <div key={indicator.name} className="space-y-2 bg-background p-3 rounded-md border">
                  <Label className="font-semibold text-xs">{indicator.label}</Label>
                  <Select name={indicator.name} defaultValue="0">
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
                  <details className="text-[10px] text-muted-foreground mt-2 group">
                    <summary className="cursor-pointer font-medium hover:text-foreground">
                      Lihat Panduan Penilaian
                    </summary>
                    <div className="space-y-1 mt-1 pt-1 border-t">
                      <p><span className="font-semibold text-red-500">1 (Rentan):</span> {indicator.desc1}</p>
                      <p><span className="font-semibold text-yellow-600">2 (Menengah):</span> {indicator.desc2}</p>
                      <p><span className="font-semibold text-green-600">3 (Mandiri):</span> {indicator.desc3}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Data KPS"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
