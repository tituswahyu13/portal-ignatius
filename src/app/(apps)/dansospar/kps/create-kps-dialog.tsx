"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createKpsAction, getUmatByLingkungan } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const INDICATORS = [
  { 
    name: "skorPekerjaan", 
    label: "1. Pekerjaan & Pemasukan (25%)",
    desc1: "Serabutan, tidak menentu, atau bergantung belas kasihan orang lain.",
    desc2: "Pemasukan rutin bulanan ada, namun pas-pasan (habis untuk bulanan).",
    desc3: "Pemasukan stabil/punya usaha berjalan, mampu menabung rutin."
  },
  { 
    name: "skorPangan", 
    label: "2. Kebutuhan Pangan (20%)",
    desc1: "Sering kesulitan makan harian (hanya mampu 1-2 kali sehari).",
    desc2: "Makan 3 kali sehari terpenuhi, namun menu seadanya (rendah gizi).",
    desc3: "Kebutuhan pangan harian sangat terjamin dan bergizi seimbang."
  },
  { 
    name: "skorSandang", 
    label: "3. Sandang (Pakaian) (10%)",
    desc1: "Kesulitan membeli pakaian baru, baju yang dimiliki sangat terbatas, lusuh, atau mengandalkan donasi/pemberian baju bekas layak pakai.",
    desc2: "Mampu membeli pakaian baru hanya pada momen tertentu, sisanya menggunakan pakaian yang ada secara hemat.",
    desc3: "Kebutuhan sandang terpenuhi dengan sangat baik, mampu membeli pakaian baru kapan saja."
  },
  { 
    name: "skorPapan", 
    label: "4. Tempat Tinggal (15%)",
    desc1: "Menumpang di tempat kerabat, tidak layak huni, atau terancam digusur.",
    desc2: "Tinggal di rumah warisan bersama (belum dibagi) atau kontrak/kos layak.",
    desc3: "Rumah milik pribadi yang sah (sertifikat sendiri) dan layak huni."
  },
  { 
    name: "skorKesehatan", 
    label: "5. Kesehatan (15%)",
    desc1: "Ada sakit kronis/lansia rentan, tidak ada jaminan/BPJS, obat tersendat.",
    desc2: "Memiliki BPJS aktif (PBI/Mandiri Kelas 3), kondisi fisik umum sehat.",
    desc3: "Punya proteksi kesehatan yang baik (BPJS Kelas 1/2 atau asuransi swasta)."
  },
  { 
    name: "skorPendidikan", 
    label: "6. Pendidikan (10%)",
    desc1: "Anak menunggak biaya sekolah, terancam putus sekolah/kuliah karena biaya.",
    desc2: "Anak bersekolah lancar, namun sering kesulitan saat bayar uang ujian/buku.",
    desc3: "Seluruh biaya sekolah/kuliah anak terbayar lancar tanpa kendala finansial."
  },
  { 
    name: "skorSosial", 
    label: "7. Sosial Komunitas (5%)",
    desc1: "Tidak pernah mampu membayar iuran lingkungan karena faktor ekonomi.",
    desc2: "Kadang-kadang membayar iuran jika ada dana lebih di dompet.",
    desc3: "Rutin membayar iuran lingkungan, kolekte, dan aktif menjadi donatur aksi sosial."
  }
];

export function CreateKpsDialog({ 
  lingkungan,
  restriction
}: { 
  lingkungan: any[],
  restriction?: { restricted: boolean, lingkunganId: number }
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedLingkungan, setSelectedLingkungan] = useState<string>(
    restriction?.restricted ? restriction.lingkunganId.toString() : ""
  );
  const [umatList, setUmatList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUmatId, setSelectedUmatId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // States for autofill
  const [autofillPekerjaan, setAutofillPekerjaan] = useState("");
  const [autofillProfesi, setAutofillProfesi] = useState("");
  const [autofillNik, setAutofillNik] = useState("");

  useEffect(() => {
    if (selectedLingkungan) {
      getUmatByLingkungan(parseInt(selectedLingkungan)).then(setUmatList);
    } else {
      setUmatList([]);
    }
    // Reset selection when lingkungan changes
    setSelectedUmatId("");
    setSearchQuery("");
    setAutofillPekerjaan("");
    setAutofillProfesi("");
    setAutofillNik("");
  }, [selectedLingkungan]);

  const filteredUmat = umatList.filter(u => u.nama.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectUmat = (u: any) => {
    setSelectedUmatId(u.id);
    setSearchQuery(u.nama);
    setAutofillPekerjaan(u.pekerjaan || "");
    setAutofillProfesi(u.profesi || "");
    setAutofillNik(u.nikMasked || "");
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    if (!selectedUmatId) {
      setError("Silakan pilih Data Umat dari daftar.");
      setLoading(false);
      return;
    }
    formData.append("umatId", selectedUmatId);

    const result = await createKpsAction(formData);

    if (result.success) {
      setOpen(false);
      setSelectedUmatId("");
      setSearchQuery("");
      setAutofillPekerjaan("");
      setAutofillProfesi("");
      setAutofillNik("");
    } else {
      setError(result.error || "Gagal menyimpan data");
    }
    setLoading(false);
  };

  return (
    <>
      <AlertDialog open={!!error} onOpenChange={(open) => { if(!open) setError(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Peringatan Pendaftaran</AlertDialogTitle>
            <AlertDialogDescription className="text-red-600 font-medium">
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError("")}>Mengerti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Tambah Data KPS</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pendaftaran Keluarga Pra-Sejahtera (KPS)</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lingkunganId">Lingkungan <span className="text-red-500">*</span></Label>
              <Select 
                name="lingkunganId" 
                value={selectedLingkungan}
                onValueChange={setSelectedLingkungan}
                disabled={restriction?.restricted}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Lingkungan" />
                </SelectTrigger>
                <SelectContent>
                  {lingkungan.map((l: any) => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.namaLingkungan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {restriction?.restricted && (
                <input type="hidden" name="lingkunganId" value={restriction.lingkunganId.toString()} />
              )}
            </div>
            
            <div className="space-y-2 relative">
              <Label>Nama Kepala Keluarga (Data Umat) <span className="text-red-500">*</span></Label>
              <div 
                className="relative"
                onBlur={(e) => {
                  // timeout to allow click on dropdown items
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              >
                <Input 
                  placeholder={selectedLingkungan ? "Ketik nama untuk mencari..." : "Pilih lingkungan dahulu"} 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUmatId(""); // reset if they type
                    setAutofillPekerjaan("");
                    setAutofillProfesi("");
                    setAutofillNik("");
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (selectedLingkungan) setShowDropdown(true);
                  }}
                  disabled={!selectedLingkungan}
                  required={!selectedUmatId}
                />
                
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-y-auto">
                    {filteredUmat.length > 0 ? (
                      filteredUmat.map(u => (
                        <div 
                          key={u.id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                          onClick={() => handleSelectUmat(u)}
                        >
                          {u.nama}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        Tidak ada umat ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Pilih umat yang sudah terdaftar di Master Data Umat.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NIK (Opsional - Perbarui Data)</Label>
              <Input 
                name="nik" 
                placeholder="Isi 16 digit NIK baru" 
                maxLength={16} 
                defaultValue={autofillNik} 
                key={`nik-${selectedUmatId}`}
              />
              <p className="text-xs text-muted-foreground">Ketik ulang 16 digit untuk mengubah NIK tersensor.</p>
            </div>
            <div className="space-y-2">
              <Label>Pekerjaan (Opsional - Perbarui Data)</Label>
              <Input 
                name="pekerjaan" 
                placeholder="Misal: Karyawan Swasta, Wiraswasta" 
                defaultValue={autofillPekerjaan}
                key={`pekerjaan-${selectedUmatId}`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Profesi/Keahlian (Opsional)</Label>
              <Input 
                name="profesi" 
                placeholder="Misal: Teknisi, Penjahit, Guru" 
                defaultValue={autofillProfesi}
                key={`profesi-${selectedUmatId}`}
              />
            </div>
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
    </>
  );
}
