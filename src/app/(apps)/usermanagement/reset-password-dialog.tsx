"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetUserPassword } from "./actions";
import { KeyRound, RefreshCw, Eye, EyeOff } from "lucide-react";

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleReset = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (password.length < 6) {
      setErrorMsg("Password harus minimal 6 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await resetUserPassword(user.email, password);
      if (res.success) {
        setSuccessMsg(`Password untuk ${user.name} berhasil di-reset.`);
        setPassword("");
        setShowPassword(false);
        // Do not close automatically so admin can see the success message and new password
      } else {
        setErrorMsg(res.error || "Gagal mereset password.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Masukkan password baru untuk pengguna <strong>{user.name}</strong> ({user.email}).
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-destructive/15 text-destructive p-3 text-sm rounded-md mx-4 mt-2">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 p-3 text-sm rounded-md mx-4 mt-2">
            {successMsg}
          </div>
        )}

        <div className="grid gap-4 py-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="w-full text-xs" 
            onClick={generateRandomPassword}
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Buat Password Acak
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleReset} disabled={isPending || password.length < 6}>
            {isPending ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
