import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "../(auth)/login/actions";
import { getCurrentUser, hasModuleAccess } from "@/lib/auth/permissions";

import { PortalSidebar } from "./portal-sidebar";

export default async function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  // Calculate which modules the user has access to
  const canAccessDansospar = await hasModuleAccess("DANSOSPAR");
  const canAccessDataUmat = await hasModuleAccess("DATAUMAT");
  const canAccessGlobal = await hasModuleAccess("GLOBAL");
  
  // Extract user info for sidebar
  const userName = user?.name || "Pengguna";
  // Find highest role name (fallback to User if none)
  const roleName = user?.userRoles?.[0]?.role?.name || "User";
  const initials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <PortalSidebar 
        userName={userName}
        roleName={roleName}
        initials={initials}
        canAccessDansospar={canAccessDansospar}
        canAccessDataUmat={canAccessDataUmat}
        canAccessGlobal={canAccessGlobal}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
