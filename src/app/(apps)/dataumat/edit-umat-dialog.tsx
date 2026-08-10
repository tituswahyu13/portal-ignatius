"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Loader2 } from "lucide-react";
import { updateDataUmat } from "./actions";


interface EditUmatDialogProps {
  umat: any;
  lingkungans: { id: number; namaLingkungan: string }[];
  isRestricted: boolean;
}

export function EditUmatDialog({ umat, lingkungans, isRestricted }: EditUmatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identitas");

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await updateDataUmat(umat.id, formData);
      
      if (result.success) {
        alert("Berhasil: Data Umat berhasil diperbarui");
        setOpen(false);
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      alert("Gagal: Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to format date for input type="date"
  const formattedDate = umat.tanggalLahir 
    ? new Date(umat.tanggalLahir).toISOString().split('T')[0] 
    : "";

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setActiveTab("identitas");
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Data Umat">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <form action={onSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Edit Data Umat</DialogTitle>
            <DialogDescription>
              Ubah informasi data umat.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="identitas">Identitas</TabsTrigger>
                <TabsTrigger value="alamat">Alamat</TabsTrigger>
                <TabsTrigger value="tambahan">Tambahan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="identitas" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nama">Nama Lengkap *</Label>
                    <Input id="nama" name="nama" defaultValue={umat.nama} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="namaBaptis">Nama Baptis</Label>
                    <Input id="namaBaptis" name="namaBaptis" defaultValue={umat.namaBaptis || ""} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nik">NIK *</Label>
                    <Input 
                      id="nik" 
                      name="nik" 
                      maxLength={16} 
                      required 
                      defaultValue={umat.nikMasked || ""} 
                      placeholder="Wajib diisi"
                    />
                    <p className="text-[10px] text-muted-foreground">Ketik ulang 16 digit NIK jika ingin diubah.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kk">Nomor KK *</Label>
                    <Input 
                      id="kk" 
                      name="kk" 
                      maxLength={16} 
                      required 
                      defaultValue={umat.kkMasked || ""} 
                      placeholder="Wajib diisi"
                    />
                    <p className="text-[10px] text-muted-foreground">Ketik ulang 16 digit KK jika ingin diubah.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lingkunganId">Lingkungan *</Label>
                    <Select name="lingkunganId" defaultValue={umat.lingkunganId?.toString()} disabled={isRestricted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Lingkungan" />
                      </SelectTrigger>
                      <SelectContent>
                        {lingkungans.map((l) => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.namaLingkungan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isRestricted && (
                      <input type="hidden" name="lingkunganId" value={umat.lingkunganId?.toString()} />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                    <Select name="jenisKelamin" defaultValue={umat.jenisKelamin || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki (L)</SelectItem>
                        <SelectItem value="P">Perempuan (P)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                    <Input id="tanggalLahir" name="tanggalLahir" type="date" defaultValue={formattedDate} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="agama">Agama</Label>
                    <Select name="agama" defaultValue={umat.agama || "Katolik"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Katolik">Katolik</SelectItem>
                        <SelectItem value="Kristen">Kristen</SelectItem>
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Hindu">Hindu</SelectItem>
                        <SelectItem value="Buddha">Buddha</SelectItem>
                        <SelectItem value="Konghucu">Konghucu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alamat" className="space-y-4 mt-0">
                <div className="grid gap-2">
                  <Label htmlFor="alamat">Alamat Lengkap</Label>
                  <Input id="alamat" name="alamat" defaultValue={umat.alamat || ""} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kelurahan">Kelurahan</Label>
                    <Input id="kelurahan" name="kelurahan" defaultValue={umat.kelurahan || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kecamatan">Kecamatan</Label>
                    <Input id="kecamatan" name="kecamatan" defaultValue={umat.kecamatan || ""} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kota">Kota/Kabupaten</Label>
                    <Input id="kota" name="kota" defaultValue={umat.kota || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="noHp">No. Handphone</Label>
                    <Input id="noHp" name="noHp" defaultValue={umat.noHp || ""} />
                  </div>
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="statusRumah">Status Rumah</Label>
                  <Select name="statusRumah" defaultValue={umat.statusRumah || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                      <SelectItem value="Sewa/Kontrak">Sewa/Kontrak</SelectItem>
                      <SelectItem value="Menumpang">Menumpang</SelectItem>
                      <SelectItem value="Kosan">Kosan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="tambahan" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pekerjaan">Pekerjaan</Label>
                    <Input id="pekerjaan" name="pekerjaan" defaultValue={umat.pekerjaan || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profesi">Profesi/Keahlian</Label>
                    <Input id="profesi" name="profesi" defaultValue={umat.profesi || ""} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                    <Input id="pendidikan" name="pendidikan" defaultValue={umat.pendidikan || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusNikah">Status Pernikahan</Label>
                    <Select name="statusNikah" defaultValue={umat.statusNikah || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                        <SelectItem value="Menikah">Menikah</SelectItem>
                        <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                        <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kondisiTubuh">Kondisi Tubuh (Kesehatan)</Label>
                    <Input id="kondisiTubuh" name="kondisiTubuh" defaultValue={umat.kondisiTubuh || ""} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusAktivitas">Status Aktivitas</Label>
                    <Input id="statusAktivitas" name="statusAktivitas" defaultValue={umat.statusAktivitas || ""} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="suku">Suku / Golongan</Label>
                  <Input id="suku" name="suku" defaultValue={umat.suku || ""} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
