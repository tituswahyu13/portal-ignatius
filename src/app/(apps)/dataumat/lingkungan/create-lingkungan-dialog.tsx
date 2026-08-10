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
import { Plus, Loader2 } from "lucide-react";
import { createLingkungan } from "./actions";


export function CreateLingkunganDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await createLingkungan(formData);
      
      if (result.success) {
        alert("Berhasil: Lingkungan baru berhasil ditambahkan");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Lingkungan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Lingkungan Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data lingkungan baru untuk mengelompokkan umat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="namaLingkungan">Nama Lingkungan</Label>
              <Input
                id="namaLingkungan"
                name="namaLingkungan"
                placeholder="Contoh: St. Petrus"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wilayah">Wilayah</Label>
              <Input
                id="wilayah"
                name="wilayah"
                placeholder="Contoh: Wilayah 1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
