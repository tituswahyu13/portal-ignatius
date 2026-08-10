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
import { Plus, Loader2 } from "lucide-react";
import { createDataUmat } from "./actions";


interface CreateUmatDialogProps {
  lingkungans: { id: number; namaLingkungan: string }[];
  userLingkunganId: number | null;
  isRestricted: boolean;
}

export function CreateUmatDialog({ lingkungans, userLingkunganId, isRestricted }: CreateUmatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identitas");

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      // Validasi NIK dan KK
      const nik = formData.get("nik") as string;
      const kk = formData.get("kk") as string;
      
      if (!nik || nik.length < 16) {
        alert("Validasi Gagal: NIK tidak valid (minimal 16 digit)");
        setIsLoading(false);
        return;
      }

      if (!kk || kk.length < 16) {
        alert("Validasi Gagal: Nomor KK tidak valid (minimal 16 digit)");
        setIsLoading(false);
        return;
      }

      const result = await createDataUmat(formData);
      
      if (result.success) {
        alert("Berhasil: Data Umat baru berhasil ditambahkan");
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

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setActiveTab("identitas");
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Umat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <form action={onSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Tambah Data Umat Baru</DialogTitle>
            <DialogDescription>
              Lengkapi informasi data umat secara detail.
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
                    <Input id="nama" name="nama" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="namaBaptis">Nama Baptis</Label>
                    <Input id="namaBaptis" name="namaBaptis" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nik">NIK (16 Digit) *</Label>
                    <Input id="nik" name="nik" maxLength={16} required placeholder="Wajib diisi & dienkripsi" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kk">Nomor KK (16 Digit) *</Label>
                    <Input id="kk" name="kk" maxLength={16} required placeholder="Wajib diisi & dienkripsi" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lingkunganId">Lingkungan *</Label>
                    <Select name="lingkunganId" defaultValue={userLingkunganId ? userLingkunganId.toString() : ""} disabled={isRestricted}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Lingkungan" />
                      </SelectTrigger>
                      <SelectContent>
                        {lingkungans.map((l) => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.namaLingkungan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* If disabled, we need a hidden input to submit the value */}
                    {isRestricted && userLingkunganId && (
                      <input type="hidden" name="lingkunganId" value={userLingkunganId.toString()} />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                    <Select name="jenisKelamin">
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
                    <Input id="tanggalLahir" name="tanggalLahir" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="agama">Agama</Label>
                    <Select name="agama" defaultValue="Katolik">
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
                  <Input id="alamat" name="alamat" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kelurahan">Kelurahan</Label>
                    <Input id="kelurahan" name="kelurahan" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kecamatan">Kecamatan</Label>
                    <Input id="kecamatan" name="kecamatan" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kota">Kota/Kabupaten</Label>
                    <Input id="kota" name="kota" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="noHp">No. Handphone</Label>
                    <Input id="noHp" name="noHp" placeholder="08..." />
                  </div>
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="statusRumah">Status Rumah</Label>
                  <Select name="statusRumah">
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
                    <Input id="pekerjaan" name="pekerjaan" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profesi">Profesi/Keahlian</Label>
                    <Input id="profesi" name="profesi" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                    <Input id="pendidikan" name="pendidikan" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusNikah">Status Pernikahan</Label>
                    <Select name="statusNikah">
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
                    <Input id="kondisiTubuh" name="kondisiTubuh" placeholder="Misal: Sehat, Disabilitas..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusAktivitas">Status Aktivitas</Label>
                    <Input id="statusAktivitas" name="statusAktivitas" placeholder="Misal: Aktif, Pasif" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="suku">Suku / Golongan</Label>
                  <Input id="suku" name="suku" />
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
              Simpan Data Umat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
