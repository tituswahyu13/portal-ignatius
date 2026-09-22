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
import { Edit, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateDataUmat } from "./actions";

interface EditUmatDialogProps {
  umat: any;
  lingkungans: { id: number; namaLingkungan: string }[];
  isRestricted: boolean;
}

// Normalizers to handle legacy/CSV uppercase and varied values
function normalizeAgama(val: string | null | undefined): string {
  if (!val) return "Katolik";
  const upper = val.trim().toUpperCase();
  if (upper.includes("KATOLIK") || upper.includes("KATHOLIK")) return "Katolik";
  if (upper.includes("KRISTEN") || upper.includes("PROTESTAN")) return "Kristen";
  if (upper.includes("ISLAM")) return "Islam";
  if (upper.includes("HINDU")) return "Hindu";
  if (upper.includes("BUDDHA") || upper.includes("BUDHA")) return "Buddha";
  if (upper.includes("KONGHUCU") || upper.includes("KHONGHUCU")) return "Konghucu";
  return "Katolik";
}

function normalizeStatusNikah(val: string | null | undefined): string {
  if (!val) return "";
  const upper = val.trim().toUpperCase();
  if (upper.includes("LAJANG") || upper.includes("BELUM") || upper.includes("SINGLE")) return "Belum Menikah";
  if (upper.includes("MENIKAH") || upper.includes("KAWIN")) return "Menikah";
  if (upper.includes("CERAI HIDUP") || upper.includes("PISAH")) return "Cerai Hidup";
  if (upper.includes("CERAI MATI") || upper.includes("JANDA") || upper.includes("DUDA")) return "Cerai Mati";
  return val;
}

function normalizeStatusRumah(val: string | null | undefined): string {
  if (!val) return "";
  const upper = val.trim().toUpperCase();
  if (upper.includes("SENDIRI")) return "Milik Sendiri";
  if (upper.includes("KELUARGA") || upper.includes("ORANG TUA")) return "Milik Keluarga";
  if (upper.includes("SEWA") || upper.includes("KONTRAK")) return "Sewa/Kontrak";
  if (upper.includes("TUMPANG") || upper.includes("MENUMPANG")) return "Menumpang";
  if (upper.includes("KOS")) return "Kosan";
  return val;
}

function normalizeJenisKelamin(val: string | null | undefined): string {
  if (!val) return "";
  const upper = val.trim().toUpperCase();
  if (upper.startsWith("L")) return "L";
  if (upper.startsWith("P") || upper.startsWith("W")) return "P";
  return val;
}

export function EditUmatDialog({ umat, lingkungans, isRestricted }: EditUmatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identitas");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await updateDataUmat(umat.id, formData);
      
      if (result.success) {
        setSuccessMsg("Data Umat berhasil diperbarui.");
        setTimeout(() => {
          setOpen(false);
          setSuccessMsg(null);
        }, 1000);
      } else {
        setErrorMsg(result.message || "Terjadi kesalahan saat menyimpan data.");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
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
      if (!val) {
        setActiveTab("identitas");
        setErrorMsg(null);
        setSuccessMsg(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Data Umat">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-hidden flex flex-col">
        <form action={onSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Edit Data Umat</DialogTitle>
            <DialogDescription>
              Ubah informasi data umat. Pastikan data terisi dengan benar.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2 shrink-0">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 shrink-0">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="identitas">Identitas</TabsTrigger>
                <TabsTrigger value="alamat">Alamat</TabsTrigger>
                <TabsTrigger value="tambahan">Tambahan</TabsTrigger>
              </TabsList>
              
              {/* Tab 1: Identitas - forceMount to keep input values preserved in FormData */}
              <TabsContent value="identitas" forceMount className="space-y-4 mt-0 data-[state=inactive]:hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nama">Nama Lengkap *</Label>
                    <Input id="nama" name="nama" defaultValue={umat.nama} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="namaBaptis">Nama Baptis</Label>
                    <Input id="namaBaptis" name="namaBaptis" defaultValue={umat.namaBaptis || ""} placeholder="Contoh: Francisca" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nik">
                      NIK (16 Digit)
                      <span className="text-xs text-muted-foreground font-normal ml-1">(Opsional)</span>
                    </Label>
                    <Input 
                      id="nik" 
                      name="nik" 
                      maxLength={16} 
                      defaultValue={umat.nikMasked || ""} 
                      placeholder="Kosongkan jika belum ada data"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {umat.nikMasked 
                        ? "Ketik ulang 16 digit NIK baru jika ingin mengubah." 
                        : "Belum ada NIK. Isi 16 digit jika data sudah ada."}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="kk">
                      Nomor KK (16 Digit)
                      <span className="text-xs text-muted-foreground font-normal ml-1">(Opsional)</span>
                    </Label>
                    <Input 
                      id="kk" 
                      name="kk" 
                      maxLength={16} 
                      defaultValue={umat.kkMasked || ""} 
                      placeholder="Kosongkan jika belum ada nomor KK"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {umat.kkMasked 
                        ? "Ketik ulang 16 digit KK baru jika ingin mengubah." 
                        : "Belum ada KK. Isi 16 digit jika data sudah ada."}
                    </p>
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
                    <Select name="jenisKelamin" defaultValue={normalizeJenisKelamin(umat.jenisKelamin)}>
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
                    <Select name="agama" defaultValue={normalizeAgama(umat.agama)}>
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

              {/* Tab 2: Alamat - forceMount to keep input values preserved in FormData */}
              <TabsContent value="alamat" forceMount className="space-y-4 mt-0 data-[state=inactive]:hidden">
                <div className="grid gap-2">
                  <Label htmlFor="alamat">Alamat Lengkap</Label>
                  <Input id="alamat" name="alamat" defaultValue={umat.alamat || ""} placeholder="Contoh: Jl. Magelang No. 12" />
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
                    <Label htmlFor="noHp">No. Handphone / WA</Label>
                    <Input id="noHp" name="noHp" defaultValue={umat.noHp || ""} placeholder="Contoh: 08123456789" />
                  </div>
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="statusRumah">Status Rumah</Label>
                  <Select name="statusRumah" defaultValue={normalizeStatusRumah(umat.statusRumah)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status Kepemilikan Rumah..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                      <SelectItem value="Milik Keluarga">Milik Keluarga</SelectItem>
                      <SelectItem value="Sewa/Kontrak">Sewa/Kontrak</SelectItem>
                      <SelectItem value="Menumpang">Menumpang</SelectItem>
                      <SelectItem value="Kosan">Kosan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Tab 3: Tambahan - forceMount to keep input values preserved in FormData */}
              <TabsContent value="tambahan" forceMount className="space-y-4 mt-0 data-[state=inactive]:hidden">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pekerjaan">Pekerjaan</Label>
                    <Input id="pekerjaan" name="pekerjaan" defaultValue={umat.pekerjaan || ""} placeholder="Contoh: Karyawan Swasta" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profesi">Profesi/Keahlian</Label>
                    <Input id="profesi" name="profesi" defaultValue={umat.profesi || ""} placeholder="Contoh: Guru, Montir, dll." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pendidikan">Pendidikan Terakhir</Label>
                    <Input id="pendidikan" name="pendidikan" defaultValue={umat.pendidikan || ""} placeholder="Contoh: SLTA/SMA, S1, dll." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusNikah">Status Pernikahan</Label>
                    <Select name="statusNikah" defaultValue={normalizeStatusNikah(umat.statusNikah)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status Pernikahan..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Belum Menikah">Belum Menikah (Lajang)</SelectItem>
                        <SelectItem value="Menikah">Menikah</SelectItem>
                        <SelectItem value="Cerai Hidup">Cerai Hidup / Pisah Rumah</SelectItem>
                        <SelectItem value="Cerai Mati">Cerai Mati (Janda / Duda)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kondisiTubuh">Kondisi Tubuh (Kesehatan)</Label>
                    <Input id="kondisiTubuh" name="kondisiTubuh" defaultValue={umat.kondisiTubuh || ""} placeholder="Contoh: NORMAL / Disabilitas" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusAktivitas">Status Aktivitas Sosial</Label>
                    <Input id="statusAktivitas" name="statusAktivitas" defaultValue={umat.statusAktivitas || ""} placeholder="Contoh: WARGA BIASA / Pengurus" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="suku">Suku / Golongan</Label>
                  <Input id="suku" name="suku" defaultValue={umat.suku || ""} placeholder="Contoh: Jawa, Tionghoa, Batak, dll." />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t shrink-0 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              * Menandakan kolom wajib diisi
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
