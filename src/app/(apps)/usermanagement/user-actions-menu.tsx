"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleUserActiveStatus } from "./actions";
import { EditUserDialog } from "./edit-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, UserX, UserCheck, KeyRound } from "lucide-react";

export function UserActionsMenu({ 
  user, 
  roles, 
  lingkungan 
}: { 
  user: any, 
  roles: any[], 
  lingkungan: any[] 
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleActive = async () => {
    const actionText = user.isActive ? "MENONAKTIFKAN" : "MENGAKTIFKAN";
    if (confirm(`Apakah Anda yakin ingin ${actionText} pengguna ${user.name}?`)) {
      setIsToggling(true);
      const res = await toggleUserActiveStatus(user.id, !user.isActive);
      setIsToggling(false);
      
      if (res.success) {
        startTransition(() => {
          router.refresh();
        });
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu aksi</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Profil</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsResetOpen(true)} className="cursor-pointer text-orange-600 focus:text-orange-600">
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Reset Password</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleToggleActive} 
            className={`cursor-pointer ${user.isActive ? 'text-destructive focus:text-destructive' : 'text-emerald-600 focus:text-emerald-600'}`}
            disabled={isToggling || isPending}
          >
            {user.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
            <span>{(isToggling || isPending) ? "Memproses..." : (user.isActive ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog 
        user={user} 
        roles={roles} 
        lingkungan={lingkungan}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ResetPasswordDialog
        user={user}
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
      />
    </>
  );
}
