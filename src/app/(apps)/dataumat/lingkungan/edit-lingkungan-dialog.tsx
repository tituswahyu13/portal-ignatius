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
import { Edit, Loader2 } from "lucide-react";
import { updateLingkungan } from "./actions";


interface EditLingkunganDialogProps {
  lingkungan: {
    id: number;
    namaLingkungan: string;
    wilayah: string;
  };
}

export function EditLingkunganDialog({ lingkungan }: EditLingkunganDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await updateLingkungan(lingkungan.id, formData);
      
      if (result.success) {
        alert("Berhasil: Lingkungan berhasil diperbarui");
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
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Lingkungan">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Lingkungan</DialogTitle>
            <DialogDescription>
              Ubah data lingkungan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="namaLingkungan">Nama Lingkungan</Label>
              <Input
                id="namaLingkungan"
                name="namaLingkungan"
                defaultValue={lingkungan.namaLingkungan}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wilayah">Wilayah</Label>
              <Input
                id="wilayah"
                name="wilayah"
                defaultValue={lingkungan.wilayah}
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
