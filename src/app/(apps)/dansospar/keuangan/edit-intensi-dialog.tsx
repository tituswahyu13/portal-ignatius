"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { updateIntensiAction } from "./actions";

export function EditIntensiDialog({ intensi }: { intensi: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateIntensiAction(intensi.id, formData);

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
        <Button variant="ghost" size="sm" title="Edit Akun Intensi">
          <Edit2 className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Akun Intensi</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kode Akun</Label>
            <Input name="kodeAccount" required defaultValue={intensi.kodeAccount} />
          </div>
          <div className="space-y-2">
            <Label>Nama Intensi</Label>
            <Input name="namaIntensi" required defaultValue={intensi.namaIntensi} />
          </div>
          <div className="space-y-2">
            <Label>Saldo Saat Ini (Rp)</Label>
            <Input type="number" name="saldo" required defaultValue={intensi.saldo} />
            <p className="text-xs text-muted-foreground">Catatan: Mengubah saldo di sini hanya untuk penyesuaian darurat. Sebaiknya gunakan fitur Mutasi Keuangan.</p>
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
