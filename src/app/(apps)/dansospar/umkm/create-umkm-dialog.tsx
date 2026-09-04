"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createUmkmAction, getKpsByLingkungan } from "./actions";
import { getUmatByLingkungan } from "../kps/actions";

export function CreateUmkmDialog({ 
  lingkungan,
  restriction
}: { 
  lingkungan: any[],
  restriction?: { restricted: boolean, lingkunganId: number }
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedLingkungan, setSelectedLingkungan] = useState<string>("");
  const [kpsList, setKpsList] = useState<any[]>([]);
  const [isKps, setIsKps] = useState(false);
  const [umatList, setUmatList] = useState<{id: string, nama: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUmatId, setSelectedUmatId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize selected lingkungan if restricted
  useEffect(() => {
    if (restriction?.restricted) {
      setSelectedLingkungan(restriction.lingkunganId.toString());
    }
  }, [restriction]);

  // Load KPS and Umat when lingkungan changes
  useEffect(() => {
    if (!selectedLingkungan) {
      setKpsList([]);
      setUmatList([]);
      return;
    }

    const fetchDeps = async () => {
      const kpsData = await getKpsByLingkungan(parseInt(selectedLingkungan));
      setKpsList(kpsData);
      const umatData = await getUmatByLingkungan(parseInt(selectedLingkungan));
      setUmatList(umatData);
    };
    
    fetchDeps();
    setSelectedUmatId("");
    setSearchQuery("");
  }, [selectedLingkungan]);

  const filteredUmat = umatList.filter(u => u.nama.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    if (!selectedUmatId) {
      setError("Silakan pilih Pemilik (Data Umat) dari daftar.");
      setLoading(false);
      return;
    }
    formData.append("umatId", selectedUmatId);

    const result = await createUmkmAction(formData);

    if (result.success) {
      setOpen(false);
      setSelectedUmatId("");
      setSearchQuery("");
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label>Nama Pemilik (Data Umat) <span className="text-red-500">*</span></Label>
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
            <div className="space-y-2">
              <Label>Pilih Lingkungan</Label>
              <Select 
                name="lingkunganId" 
                required 
                value={selectedLingkungan} 
                onValueChange={setSelectedLingkungan}
                disabled={restriction?.restricted}
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
              {restriction?.restricted && (
                <input type="hidden" name="lingkunganId" value={restriction.lingkunganId.toString()} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Nomor Induk Berusaha (NIB)</Label>
              <Input name="nib" placeholder="Opsional jika ada" />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-md bg-muted/20">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isKps" 
                checked={isKps} 
                onChange={(e) => setIsKps(e.target.checked)} 
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isKps" className="cursor-pointer">Pemilik adalah Keluarga Pra-Sejahtera (KPS)</Label>
            </div>
            
            {isKps ? (
              <div className="space-y-2">
                <Label>Pilih Data KPS (Berdasarkan Lingkungan)</Label>
                <Select name="kpsId">
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
            ) : null}
          </div>

          <div className="space-y-4 border p-4 rounded-md bg-muted/20">
            <h4 className="font-semibold text-sm">Informasi Usaha</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Usaha</Label>
                <Input name="namaUsaha" required placeholder="Cth: Warung Tegal" />
              </div>
              <div className="space-y-2">
                <Label>Kategori Usaha</Label>
                <Select name="kategoriUsaha">
                  <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produksi">Produksi</SelectItem>
                    <SelectItem value="Perdagangan">Perdagangan</SelectItem>
                    <SelectItem value="Jasa">Jasa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jenis Usaha Spesifik</Label>
              <Input name="jenisUsaha" placeholder="Cth: Kuliner" />
            </div>

            <div className="space-y-2">
              <Label>Alamat Usaha</Label>
              <Textarea name="alamatUsaha" placeholder="Kosongkan jika sama dengan alamat tinggal" />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Usaha</Label>
              <Textarea name="deskripsiUsaha" placeholder="Jelaskan secara singkat mengenai usaha ini" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Keberadaan Usaha</Label>
                <Select name="keberadaanUsaha">
                  <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sudah ada</SelectItem>
                    <SelectItem value="false">Belum ada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kondisi Usaha Saat Ini</Label>
                <Input name="kondisiUsahaSaatIni" placeholder="Cth: Berjalan lancar" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Keahlian (Skill)</Label>
              <Input name="keahlian" placeholder="Keahlian yang relevan dengan usaha" />
            </div>

            <div className="space-y-2">
              <Label>Pengalaman Usaha Sebelumnya</Label>
              <Textarea name="pengalamanUsahaSebelumnya" placeholder="Pengalaman yang dimiliki sebelumnya" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pelatihan Tata Kelola Keuangan</Label>
                <Select name="pelatihanKeuangan">
                  <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sudah mengikuti</SelectItem>
                    <SelectItem value="false">Belum mengikuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Anggota Paguyuban UMKM Paroki</Label>
                <Select name="anggotaPaguyuban">
                  <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ya</SelectItem>
                    <SelectItem value="false">Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Analisa Usaha</Label>
              <Select name="analisaUsaha">
                <SelectTrigger><SelectValue placeholder="Pilih Penilaian" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ada dan jelas">Ada dan jelas</SelectItem>
                  <SelectItem value="Ada, tetapi tidak jelas">Ada, tetapi tidak jelas</SelectItem>
                  <SelectItem value="Tidak ada">Tidak ada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
            <div className="space-y-2 col-span-2">
              <h4 className="font-semibold text-sm">Evaluasi Kelayakan (Opsional)</h4>
              <p className="text-xs text-muted-foreground">Otomatis layak jika Aset ≤ Rp 20.000.000 dan Omset Tahunan ≤ Rp 100.000.000, atau jika dikosongkan.</p>
            </div>
            <div className="space-y-2">
              <Label>Total Aset (Rp)</Label>
              <Input type="number" name="asetTotal" placeholder="Misal: 5000000" min="0" />
            </div>
            <div className="space-y-2">
              <Label>Omset Tahunan (Rp)</Label>
              <Input type="number" name="omsetTahunan" placeholder="Misal: 30000000" min="0" />
            </div>
          </div>

          <div className="space-y-2 border p-4 rounded-md bg-muted/20">
            <Label>Lampiran (Opsional)</Label>
            <Input type="file" name="lampiran" accept="image/*,.pdf" />
            <p className="text-xs text-muted-foreground">Unggah foto NIB, tempat usaha, atau dokumen pendukung lainnya.</p>
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
