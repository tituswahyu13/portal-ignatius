"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubjekByLingkungan, createSpbAction } from "../actions";

const KATEGORI_BANTUAN = [
  "Pangan",
  "Sandang",
  "Papan (Bedah Rumah)",
  "Kesehatan",
  "Pendidikan",
  "Pangruktilaya",
  "Seminari",
  "Bencana",
  "Peralatan Usaha (UMKM)"
];

export function CreateSpbForm({ lingkungans, intensis }: { lingkungans: any[], intensis: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjekType, setSubjekType] = useState<"KPS" | "UMKM">("KPS");
  const [selectedLingkungan, setSelectedLingkungan] = useState<string>("");
  const [subjekList, setSubjekList] = useState<any[]>([]);
  
  const [totalBiaya, setTotalBiaya] = useState(0);
  const [danaSwadaya, setDanaSwadaya] = useState(0);
  const [danaLingkungan, setDanaLingkungan] = useState(0);
  
  const danaParokiRequested = totalBiaya - danaSwadaya - danaLingkungan;

  // Load Subjek when lingkungan or type changes
  useEffect(() => {
    if (!selectedLingkungan) {
      setSubjekList([]);
      return;
    }
    
    let isMounted = true;
    getSubjekByLingkungan(parseInt(selectedLingkungan), subjekType).then((data) => {
      if (isMounted) setSubjekList(data);
    });
    
    return () => { isMounted = false; };
  }, [selectedLingkungan, subjekType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("subjekType", subjekType);

    const result = await createSpbAction(formData);

    if (result.success) {
      router.push("/dansospar/spb");
    } else {
      setError(result.error || "Gagal mengajukan SPB");
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
            <Select name="lingkunganId" required onValueChange={setSelectedLingkungan} value={selectedLingkungan}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Lingkungan" />
              </SelectTrigger>
              <SelectContent>
                {lingkungans.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>{l.namaLingkungan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Select name="subjekId" required disabled={!selectedLingkungan || subjekList.length === 0}>
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
            <Select name="kategoriBantuan" required>
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
            <Select name="intensiId" required>
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
      </div>

      <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold">Skema Pendanaan (Rp)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Total Biaya Kebutuhan</Label>
            <Input type="number" name="totalBiaya" required min="1" value={totalBiaya} onChange={(e) => setTotalBiaya(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Dana Swadaya Umat</Label>
            <Input type="number" name="danaSwadaya" required min="0" value={danaSwadaya} onChange={(e) => setDanaSwadaya(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Bantuan Kas Lingkungan</Label>
            <Input type="number" name="danaLingkungan" required min="0" value={danaLingkungan} onChange={(e) => setDanaLingkungan(parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        
        <div className="pt-2 border-t mt-4 flex justify-between items-center">
          <span className="font-semibold text-muted-foreground">Total Dana Diajukan ke Paroki:</span>
          <span className={`text-2xl font-bold ${danaParokiRequested <= 0 ? "text-red-500" : "text-green-600"}`}>
            Rp {danaParokiRequested.toLocaleString('id-ID')}
          </span>
        </div>
        {danaParokiRequested <= 0 && totalBiaya > 0 && (
          <p className="text-xs text-red-500 text-right">Nilai pengajuan harus lebih dari 0.</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Lampiran Dokumen</h3>
        <div className="space-y-2">
          <Label>Upload Surat Permohonan Bantuan (PDF/Image)</Label>
          <Input type="file" name="attachment" required accept=".pdf,image/*" className="cursor-pointer file:cursor-pointer" />
          <p className="text-xs text-muted-foreground">Dokumen ini akan diunggah dan disimpan ke Google Drive Paroki.</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading || danaParokiRequested <= 0}>
          {loading ? "Memproses Pengajuan..." : "Kirim Pengajuan SPB"}
        </Button>
      </div>
    </form>
  );
}
