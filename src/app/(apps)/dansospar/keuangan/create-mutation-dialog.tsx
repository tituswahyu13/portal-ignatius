"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createMutationAction } from "./actions";

const SOURCE_TYPES = [
  { value: "KOLEKTE", label: "Kolekte Umum" },
  { value: "PERSEMBAHAN_BULANAN", label: "Persembahan Bulanan" },
  { value: "APP", label: "Aksi Puasa Pembangunan (APP)" },
  { value: "DONASI", label: "Donasi Bebas" },
  { value: "SPB_REALIZATION", label: "Pencairan SPB" },
  { value: "INTER_TRANSFER", label: "Transfer Antar Kas" }
];

export function CreateMutationDialog({ accounts }: { accounts: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createMutationAction(formData);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Gagal mencatat mutasi");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Catat Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Catat Mutasi Keuangan</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Transaksi</Label>
              <Select name="type" required value={type} onValueChange={(v: "IN"|"OUT") => setType(v)}>
                <SelectTrigger className={type === "IN" ? "text-green-600 font-semibold border-green-200" : "text-red-600 font-semibold border-red-200"}>
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN" className="text-green-600">UANG MASUK (IN)</SelectItem>
                  <SelectItem value="OUT" className="text-red-600">UANG KELUAR (OUT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pilih Akun Intensi</Label>
              <Select name="intensiId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Akun" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.kodeAccount} - {acc.namaIntensi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sumber Transaksi</Label>
              <Select name="sourceType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nominal (Rp)</Label>
              <Input type="number" name="amount" required min="1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ID Referensi (Opsional)</Label>
            <Input name="referenceId" placeholder="Misal: Nomor Kuitansi atau Nomor SPB" />
          </div>

          <div className="space-y-2">
            <Label>Keterangan Lengkap</Label>
            <Input name="description" placeholder="Deskripsi transaksi..." required />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className={type === "IN" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
              {loading ? "Memproses..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
