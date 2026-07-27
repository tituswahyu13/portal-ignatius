"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserAction } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  phoneNumber: z.string().optional(),
  roleId: z.string().min(1, "Role wajib dipilih"),
  lingkunganId: z.string().optional(),
  isActive: z.boolean(),
});

export function EditUserDialog({ 
  user, 
  roles, 
  lingkungan,
  open,
  onOpenChange 
}: { 
  user: any, 
  roles: any[], 
  lingkungan: any[],
  open: boolean,
  onOpenChange: (open: boolean) => void
}) {
  const [errorMsg, setErrorMsg] = useState("");

  const defaultRoleId = user.userRoles?.[0]?.roleId?.toString() || "";
  const defaultLingkunganId = user.lingkunganId ? user.lingkunganId.toString() : "none";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      roleId: defaultRoleId,
      lingkunganId: defaultLingkunganId,
      isActive: user.isActive,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setErrorMsg("");
    
    const submitData = {
      ...values,
      lingkunganId: values.lingkunganId === "none" ? undefined : values.lingkunganId,
    };

    const res = await updateUserAction(user.id, submitData);
    
    if (res.success) {
      onOpenChange(false);
    } else {
      setErrorMsg(res.error || "Gagal mengupdate pengguna");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Ubah data profil pengguna atau perbarui peran (role) sistem mereka.
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

            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input disabled value={user.email} className="bg-muted" />
              <p className="text-[10px] text-muted-foreground">Email terikat dengan Auth dan tidak bisa diubah langsung.</p>
            </FormItem>

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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Akun Aktif</FormLabel>
                    <p className="text-[10px] text-muted-foreground">
                      Matikan untuk mencegah pengguna login.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
