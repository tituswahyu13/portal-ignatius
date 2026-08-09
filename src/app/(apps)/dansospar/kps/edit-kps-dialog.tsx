"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateKpsAction, getUmatByLingkungan } from "./actions";
import { Edit2 } from "lucide-react";

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

export function EditKpsDialog({ kps, lingkungan }: { kps: any, lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedLingkungan, setSelectedLingkungan] = useState<string>(
    kps.lingkunganId?.toString() || ""
  );
  const [umatList, setUmatList] = useState<{id: string, nama: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState(kps.umat?.nama || "");
  const [selectedUmatId, setSelectedUmatId] = useState(kps.umatId?.toString() || "");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (selectedLingkungan) {
      getUmatByLingkungan(parseInt(selectedLingkungan)).then(setUmatList);
    } else {
      setUmatList([]);
    }
  }, [selectedLingkungan]);

  // Update selected umat when modal opens or kps changes
  useEffect(() => {
    if (open && kps) {
      setSelectedLingkungan(kps.lingkunganId?.toString() || "");
      setSelectedUmatId(kps.umatId?.toString() || "");
      setSearchQuery(kps.umat?.nama || "");
    }
  }, [open, kps]);

  const filteredUmat = umatList.filter(u => u.nama.toLowerCase().includes(searchQuery.toLowerCase()));

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
              <Label>Lingkungan</Label>
              <Select 
                name="lingkunganId" 
                required 
                value={selectedLingkungan}
                onValueChange={(val) => {
                  setSelectedLingkungan(val);
                  setSelectedUmatId(""); // reset if lingkungan changed
                  setSearchQuery("");
                }}
              >
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
            
            <div className="space-y-2 relative">
              <Label>Nama Kepala Keluarga (Data Umat) <span className="text-red-500">*</span></Label>
              <div 
                className="relative"
                onBlur={(e) => {
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              >
                <Input 
                  placeholder={selectedLingkungan ? "Ketik nama untuk mencari..." : "Pilih lingkungan dahulu"} 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUmatId(""); 
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
                          onClick={() => {
                            setSelectedUmatId(u.id);
                            setSearchQuery(u.nama);
                            setShowDropdown(false);
                          }}
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NIK (Biarkan jika tidak diubah)</Label>
              <Input name="nik" placeholder="Masukkan 16 digit NIK baru" defaultValue={kps.nikDecryptedMasked || ""} />
              <p className="text-xs text-muted-foreground">Ketik ulang 16 digit jika ingin mengubah NIK.</p>
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
