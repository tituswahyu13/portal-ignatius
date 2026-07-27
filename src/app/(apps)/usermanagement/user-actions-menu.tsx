"use client";

import { useState } from "react";
import { softDeleteUserAction } from "./actions";
import { EditUserDialog } from "./edit-user-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin MENGHAPUS (Soft Delete) pengguna ${user.name}? Mereka tidak akan bisa login lagi.`)) {
      setIsDeleting(true);
      await softDeleteUserAction(user.id, user.email);
      setIsDeleting(false);
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
          
          <DropdownMenuItem 
            onClick={handleDelete} 
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={isDeleting || !user.isActive}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{isDeleting ? "Menghapus..." : "Soft Delete"}</span>
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
    </>
  );
}
