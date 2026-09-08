"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateUmkmAction, getKpsByLingkungan } from "./actions";
import { getUmatByLingkungan } from "../kps/actions";
import { Edit2 } from "lucide-react";

export function EditUmkmDialog({ umkm, lingkungan }: { umkm: any, lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedLingkungan, setSelectedLingkungan] = useState<string>(umkm.lingkunganId?.toString() || "");
  const [kpsList, setKpsList] = useState<any[]>([]);
  const [isKps, setIsKps] = useState<boolean>(!!umkm.kpsId);
  const [umatList, setUmatList] = useState<{id: string, nama: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState(umkm.umat?.nama || "");
  const [selectedUmatId, setSelectedUmatId] = useState(umkm.umatId?.toString() || "");
  const [showDropdown, setShowDropdown] = useState(false);

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
    
    // Only reset Umat selection if environment actually changed from original
    if (selectedLingkungan !== umkm.lingkunganId?.toString()) {
      setSelectedUmatId("");
      setSearchQuery("");
    }
  }, [selectedLingkungan, umkm.lingkunganId]);

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
    
    const file = formData.get("lampiran") as File | null;
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Ukuran file lampiran maksimal 5 MB.");
      setLoading(false);
      return;
    }

    formData.append("umatId", selectedUmatId);

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
            ) : null}
          </div>

          <div className="space-y-4 border p-4 rounded-md bg-muted/20">
            <h4 className="font-semibold text-sm">Informasi Usaha</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Usaha</Label>
                <Input name="namaUsaha" required defaultValue={umkm.namaUsaha} />
              </div>
              <div className="space-y-2">
                <Label>Kategori Usaha</Label>
                <Select name="kategoriUsaha" defaultValue={umkm.kategoriUsaha || undefined}>
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
              <Input name="jenisUsaha" defaultValue={umkm.jenisUsaha} />
            </div>

            <div className="space-y-2">
              <Label>Alamat Usaha</Label>
              <Textarea name="alamatUsaha" defaultValue={umkm.alamatUsaha || ""} placeholder="Kosongkan jika sama dengan alamat tinggal" />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Usaha</Label>
              <Textarea name="deskripsiUsaha" defaultValue={umkm.deskripsiUsaha || ""} placeholder="Jelaskan secara singkat mengenai usaha ini" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Keberadaan Usaha</Label>
                <Select name="keberadaanUsaha" defaultValue={umkm.keberadaanUsaha !== null ? umkm.keberadaanUsaha.toString() : undefined}>
                  <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sudah ada</SelectItem>
                    <SelectItem value="false">Belum ada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kondisi Usaha Saat Ini</Label>
                <Input name="kondisiUsahaSaatIni" defaultValue={umkm.kondisiUsahaSaatIni || ""} placeholder="Cth: Berjalan lancar" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Keahlian (Skill)</Label>
              <Input name="keahlian" defaultValue={umkm.keahlian || ""} placeholder="Keahlian yang relevan dengan usaha" />
            </div>

            <div className="space-y-2">
              <Label>Pengalaman Usaha Sebelumnya</Label>
              <Textarea name="pengalamanUsahaSebelumnya" defaultValue={umkm.pengalamanUsahaSebelumnya || ""} placeholder="Pengalaman yang dimiliki sebelumnya" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pelatihan Tata Kelola Keuangan</Label>
                <Select name="pelatihanKeuangan" defaultValue={umkm.pelatihanKeuangan !== null ? umkm.pelatihanKeuangan.toString() : undefined}>
                  <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sudah mengikuti</SelectItem>
                    <SelectItem value="false">Belum mengikuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Anggota Paguyuban UMKM Paroki</Label>
                <Select name="anggotaPaguyuban" defaultValue={umkm.anggotaPaguyuban !== null ? umkm.anggotaPaguyuban.toString() : undefined}>
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
              <Select name="analisaUsaha" defaultValue={umkm.analisaUsaha || undefined}>
                <SelectTrigger><SelectValue placeholder="Pilih Penilaian" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ada dan jelas">Ada dan jelas</SelectItem>
                  <SelectItem value="Ada, tetapi tidak jelas">Ada, tetapi tidak jelas</SelectItem>
                  <SelectItem value="Tidak ada">Tidak ada</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="space-y-2 border p-4 rounded-md bg-muted/20">
            <Label>Lampiran UMKM</Label>
            {umkm.googleDriveFileId && (
              <div className="mb-2">
                <a 
                  href={`https://drive.google.com/file/d/${umkm.googleDriveFileId}/view`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  Lihat Lampiran Saat Ini
                </a>
              </div>
            )}
            <Input type="file" name="lampiran" accept="image/*,.pdf" />
            <p className="text-xs text-muted-foreground">
              {umkm.googleDriveFileId ? "Unggah file baru jika ingin mengganti lampiran yang sudah ada." : "Unggah foto NIB, tempat usaha, atau dokumen pendukung lainnya."}
            </p>
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
