"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubjekByLingkungan, editSpbAction } from "../../actions";

const KATEGORI_BANTUAN = [
  "Pangan",
  "Sandang",
  "Papan (Bedah Rumah)",
  "Kesehatan",
  "Pendidikan",
  "Pangruktilaya",
  "Seminari",
  "Bencana",
  "Bantuan Modal Usaha"
];

export function EditSpbForm({ 
  lingkungans, 
  intensis,
  restriction,
  initialData
}: { 
  lingkungans: any[], 
  intensis: any[],
  restriction?: { restricted: boolean, lingkunganId: number },
  initialData: any
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [subjekType, setSubjekType] = useState<"KPS" | "UMKM">(initialData.kpsId ? "KPS" : "UMKM");
  const [selectedLingkungan, setSelectedLingkungan] = useState<string>(initialData.lingkunganId.toString());
  const [subjekList, setSubjekList] = useState<any[]>([]);
  const [selectedSubjekId, setSelectedSubjekId] = useState<string>(initialData.kpsId || initialData.umkmId || "");
  
  const [totalBiaya, setTotalBiaya] = useState<number | "">(parseFloat(initialData.totalBiaya));
  const [danaSwadaya, setDanaSwadaya] = useState<number | "">(parseFloat(initialData.danaSwadaya));
  const [danaLingkungan, setDanaLingkungan] = useState<number | "">(parseFloat(initialData.danaLingkungan));
  
  const [kategoriBantuan, setKategoriBantuan] = useState<string>(initialData.kategoriBantuan);
  const [selectedIntensi, setSelectedIntensi] = useState<string>(initialData.intensiId.toString());
  const [keaktifanUmat, setKeaktifanUmat] = useState<string>(initialData.keaktifanUmat || "");
  const [alasanBantuan, setAlasanBantuan] = useState<string>(initialData.alasanBantuan || "");

  const danaParokiRequested = (Number(totalBiaya) || 0) - (Number(danaSwadaya) || 0) - (Number(danaLingkungan) || 0);

  // Load Subjek when lingkungan or type changes
  useEffect(() => {
    if (!selectedLingkungan) {
      setSubjekList([]);
      return;
    }
    
    let isMounted = true;
    getSubjekByLingkungan(parseInt(selectedLingkungan), subjekType).then((data) => {
      if (isMounted) {
        setSubjekList(data);
        // if switching type, reset subjekId unless it matches initial
        if (subjekType === (initialData.kpsId ? "KPS" : "UMKM") && selectedLingkungan === initialData.lingkunganId.toString()) {
           setSelectedSubjekId(initialData.kpsId || initialData.umkmId);
        } else {
           setSelectedSubjekId("");
        }
      }
    });
    
    return () => { isMounted = false; };
  }, [selectedLingkungan, subjekType, initialData.kpsId, initialData.umkmId, initialData.lingkunganId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("subjekType", subjekType);

    const result = await editSpbAction(BigInt(initialData.id), formData);

    if (result.success) {
      router.push(`/dansospar/spb/${initialData.id}`);
    } else {
      setError(result.error || "Gagal mengubah SPB");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-xl border shadow-sm max-w-3xl">
      {error && <div className="p-4 bg-red-500/10 text-red-600 rounded-md font-medium">{error}</div>}
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Identitas & Pemohon</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Asal Lingkungan</Label>
            <Select 
              name="lingkunganId" 
              required 
              onValueChange={setSelectedLingkungan} 
              value={selectedLingkungan}
              disabled={restriction?.restricted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Lingkungan" />
              </SelectTrigger>
              <SelectContent>
                {lingkungans.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>{l.namaLingkungan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {restriction?.restricted && (
              <input type="hidden" name="lingkunganId" value={restriction.lingkunganId.toString()} />
            )}

          </div>
          <div className="space-y-2">
            <Label>Kategori Subjek (Prioritas)</Label>
            <Select value={subjekType} onValueChange={(v: "KPS"|"UMKM") => setSubjekType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KPS">Keluarga Pra-Sejahtera (KPS)</SelectItem>
                <SelectItem value="UMKM">UMKM Mikro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pilih Nama Pemohon / Subjek</Label>
          <Select name="subjekId" required value={selectedSubjekId} onValueChange={setSelectedSubjekId} disabled={!selectedLingkungan || subjekList.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={!selectedLingkungan ? "Pilih lingkungan dulu" : (subjekList.length === 0 ? "Belum ada data di lingkungan ini" : "Pilih Subjek")} />
            </SelectTrigger>
            <SelectContent>
              {subjekList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {subjekType === "KPS" ? s.namaKepalaKeluarga : `${s.namaUsaha} (${s.namaPemilik})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Rincian Bantuan</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Kategori Bantuan</Label>
            <Select name="kategoriBantuan" required value={kategoriBantuan} onValueChange={setKategoriBantuan}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_BANTUAN.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sumber Kas Intensi</Label>
            <Select name="intensiId" required value={selectedIntensi} onValueChange={setSelectedIntensi}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kas" />
              </SelectTrigger>
              <SelectContent>
                {intensis.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>{acc.namaIntensi}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Keaktifan Umat</Label>
            <Select name="keaktifanUmat" required value={keaktifanUmat} onValueChange={setKeaktifanUmat}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status Keaktifan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Kadangkala Aktif">Kadangkala Aktif</SelectItem>
                <SelectItem value="Tidak Aktif Sama Sekali">Tidak Aktif Sama Sekali</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alasan Dimohonkan Bantuan</Label>
            <Textarea 
              name="alasanBantuan" 
              required 
              value={alasanBantuan}
              onChange={(e) => setAlasanBantuan(e.target.value)}
              placeholder="Jelaskan alasan mengapa umat/subjek tersebut perlu dibantu..." 
              className="resize-none h-20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold">Skema Pendanaan (Rp)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Total Biaya Kebutuhan</Label>
            <Input type="number" name="totalBiaya" required min="1" value={totalBiaya} onChange={(e) => setTotalBiaya(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Dana Swadaya Umat</Label>
            <Input type="number" name="danaSwadaya" required min="0" value={danaSwadaya} onChange={(e) => setDanaSwadaya(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Bantuan Kas Lingkungan</Label>
            <Input type="number" name="danaLingkungan" required min="0" value={danaLingkungan} onChange={(e) => setDanaLingkungan(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="0" />
          </div>
        </div>
        
        <div className="pt-2 border-t mt-4 flex justify-between items-center">
          <span className="font-semibold text-muted-foreground">Total Dana Diajukan ke Paroki:</span>
          <span className={`text-2xl font-bold ${danaParokiRequested <= 0 ? "text-red-500" : "text-green-600"}`}>
            Rp {danaParokiRequested.toLocaleString('id-ID')}
          </span>
        </div>
        {danaParokiRequested <= 0 && (Number(totalBiaya) || 0) > 0 && (
          <p className="text-xs text-red-500 text-right">Nilai pengajuan harus lebih dari 0.</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Lampiran Dokumen Tambahan</h3>
        <div className="space-y-2">
          <Label>Upload Surat Tambahan (Opsional)</Label>
          <Input type="file" name="attachment" accept=".pdf,image/*" className="cursor-pointer file:cursor-pointer" />
          <p className="text-xs text-muted-foreground">Dokumen baru akan ditambahkan ke lampiran SPB ini. Biarkan kosong jika tidak ada dokumen baru.</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading || danaParokiRequested <= 0}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
