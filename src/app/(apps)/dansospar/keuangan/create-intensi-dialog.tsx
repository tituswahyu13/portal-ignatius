"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { createIntensiAction } from "./actions";

export function CreateIntensiDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createIntensiAction(formData);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Gagal menyimpan data");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Akun Intensi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Akun Intensi Baru</DialogTitle>
        </DialogHeader>
        
        {error && <div className="p-3 text-sm bg-red-500/10 text-red-500 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kode Akun</Label>
            <Input name="kodeAccount" required placeholder="Contoh: INT-PPM" />
          </div>
          <div className="space-y-2">
            <Label>Nama Intensi</Label>
            <Input name="namaIntensi" required placeholder="Contoh: Dana Papa Miskin" />
          </div>
          <div className="space-y-2">
            <Label>Saldo Awal (Rp)</Label>
            <Input type="number" name="saldo" defaultValue="0" min="0" required />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Akun"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
