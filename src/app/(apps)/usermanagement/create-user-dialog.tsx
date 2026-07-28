"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserAction } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Skema Validasi Zod
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phoneNumber: z.string().optional(),
  roleId: z.string().min(1, "Role wajib dipilih"),
  lingkunganId: z.string().optional(),
});

export function CreateUserDialog({ roles, lingkungan }: { roles: any[], lingkungan: any[] }) {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      roleId: "",
      lingkunganId: "none",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMsg("");
    
    // Jika lingkungan tidak dipilih, kirim null
    const submitData = {
      ...values,
      lingkunganId: values.lingkunganId === "none" ? null : values.lingkunganId,
    };

    const res = await createUserAction(submitData);
    
    if (res.success) {
      setOpen(false);
      form.reset();
    } else {
      setErrorMsg(res.error || "Gagal membuat pengguna");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Pengguna</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Pengguna Baru</DialogTitle>
          <DialogDescription>
            Tambahkan pengguna baru ke dalam sistem dan berikan hak akses role yang sesuai.
          </DialogDescription>
        </DialogHeader>
        
        {errorMsg && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {errorMsg}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Sementara</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role (Hak Akses)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role pengguna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lingkunganId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lingkungan (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih lingkungan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- Bukan Pengurus Lingkungan --</SelectItem>
                      {lingkungan.map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.namaLingkungan} - {l.wilayah}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  );
}
