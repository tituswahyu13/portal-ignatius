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
import { changeMyPassword, verifyCurrentPassword } from "@/app/actions/auth-actions";
import { Lock, Eye, EyeOff } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    if (newPassword.length < 6) {
      setErrorMsg("Password baru harus minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    startTransition(async () => {
      // Verifikasi password lama
      const isValid = await verifyCurrentPassword(currentPassword);
      if (!isValid) {
        setErrorMsg("Password saat ini salah.");
        return;
      }

      // Ubah password
      const res = await changeMyPassword(newPassword);
      if (res.success) {
        setSuccessMsg("Password berhasil diubah. Mengeluarkan sesi...");
        setTimeout(() => {
          logout();
        }, 1500);
      } else {
        setErrorMsg(res.error || "Terjadi kesalahan saat mengubah password.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMsg("");
      }
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Ubah Password
          </DialogTitle>
          <DialogDescription>
            Ubah password untuk akun Anda. Anda akan diminta untuk login kembali setelah berhasil.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {errorMsg && (
            <div className="bg-destructive/15 text-destructive p-3 text-sm rounded-md">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 p-3 text-sm rounded-md">
              {successMsg}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-password">Password Saat Ini</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Password Baru</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
            <Input
              id="confirm-password"
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleChange} disabled={isPending || !currentPassword || !newPassword || !confirmPassword}>
            {isPending ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
