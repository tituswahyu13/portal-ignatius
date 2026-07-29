"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "./change-password-dialog";
import { logout } from "@/app/(auth)/login/actions";

interface UserProfileMenuProps {
  userName: string;
  roleName: string;
  initials: string;
}

export function UserProfileMenu({ userName, roleName, initials }: UserProfileMenuProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-medium text-foreground leading-none truncate">{userName}</span>
            <span className="text-xs text-muted-foreground mt-1 truncate">{roleName}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="cursor-pointer">
            Ubah Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <button type="submit" className="w-full text-left">
              <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                Keluar
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </>
  );
}
