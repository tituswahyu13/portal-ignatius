"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { addRecurringSpbAction } from "./actions";

export function AddRecurringDialog({ kpsList, intensiList }: { kpsList: any[], intensiList: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLingkunganId, setSelectedLingkunganId] = useState<string>("all");

  const uniqueLingkungan = useMemo(() => {
    const map = new Map();
    kpsList.forEach(k => {
      if (!map.has(k.lingkungan.namaLingkungan)) {
        map.set(k.lingkungan.namaLingkungan, { name: k.lingkungan.namaLingkungan });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [kpsList]);

  const filteredKps = useMemo(() => {
    if (selectedLingkunganId === "all") return kpsList;
    return kpsList.filter(k => k.lingkungan.namaLingkungan === selectedLingkunganId);
  }, [kpsList, selectedLingkunganId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await addRecurringSpbAction(formData);

    if (result.success) {
      setOpen(false);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Penerima Rutin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Penerima Bantuan Rutin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter Lingkungan</Label>
              <Select value={selectedLingkunganId} onValueChange={setSelectedLingkunganId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Lingkungan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lingkungan</SelectItem>
                  {uniqueLingkungan.map(lingkungan => (
                    <SelectItem key={lingkungan.name} value={lingkungan.name}>
                      {lingkungan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilih KPS (Kepala Keluarga)</Label>
              <Select name="kpsId" required disabled={filteredKps.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={filteredKps.length === 0 ? "Tidak ada KPS..." : "Pilih KPS..."} />
                </SelectTrigger>
                <SelectContent>
                  {filteredKps.map((kps: any) => (
                    <SelectItem key={kps.id.toString()} value={kps.id.toString()}>
                      {kps.namaKepalaKeluarga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategori Bantuan</Label>
            <Select name="kategoriBantuan" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendidikan">Pendidikan (Beasiswa)</SelectItem>
                <SelectItem value="Pangan">Pangan (Sembako)</SelectItem>
                <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                <SelectItem value="Sandang">Sandang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nominal Bantuan Bulanan (Rp)</Label>
            <Input type="number" name="nominalBantuan" placeholder="Contoh: 500000" required min="1" />
          </div>

          <div className="space-y-2">
            <Label>Sumber Dana Intensi</Label>
            <Select name="intensiId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih sumber dana..." />
              </SelectTrigger>
              <SelectContent>
                {intensiList.map(intensi => (
                  <SelectItem key={intensi.id} value={intensi.id.toString()}>
                    {intensi.namaIntensi} ({intensi.kodeAccount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
