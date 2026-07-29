"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { logout } from "../(auth)/login/actions";

interface PortalSidebarProps {
  userName: string;
  roleName: string;
  initials: string;
  canAccessDansospar: boolean;
  canAccessGlobal: boolean;
}

export function PortalSidebar({
  userName,
  roleName,
  initials,
  canAccessDansospar,
  canAccessGlobal
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Check if we are inside a specific module (like /dansospar)
  const isInsideModule = pathname?.startsWith("/dansospar") || pathname?.startsWith("/usermanagement");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change if it's a mobile device or inside a module
  useEffect(() => {
    if (isMobile || isInsideModule) setIsOpen(false);
  }, [pathname, isMobile, isInsideModule]);

  // Determine if sidebar should be visible
  // - If mobile: visible only when isOpen
  // - If desktop: visible by default UNLESS inside a module, then only visible when isOpen
  const showSidebar = isMobile ? isOpen : (isInsideModule ? isOpen : true);

  return (
    <>
      {/* Overlay for mobile or when opened inside a module */}
      {isOpen && (isMobile || isInsideModule) && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 flex flex-col border-r bg-card 
          transition-all duration-300 ease-in-out
          ${showSidebar ? "w-64 translate-x-0" : "w-0 -translate-x-full overflow-hidden border-none"}
        `}
      >
        <div className="flex h-16 min-h-16 items-center justify-between border-b px-6">
          <h1 className="text-lg font-bold tracking-tight text-primary whitespace-nowrap">
            Portal Apps
          </h1>
          {(isMobile || isInsideModule) && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-1 flex-col justify-between py-4 overflow-y-auto">
          <nav className="flex flex-col gap-1 px-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Kembali ke Portal</span>
            </Link>
            <div className="my-4 border-t" />
            
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 whitespace-nowrap">
              Modul Aktif
            </div>
            
            {canAccessDansospar && (
              <Link
                href="/dansospar"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith("/dansospar") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  pathname?.startsWith("/dansospar") ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  ⛪
                </div>
                <span className="whitespace-nowrap">DanSosPar</span>
              </Link>
            )}

            {canAccessGlobal && (
              <Link
                href="/usermanagement"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname?.startsWith("/usermanagement") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  pathname?.startsWith("/usermanagement") ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  👥
                </div>
                <span className="whitespace-nowrap">Manajemen User</span>
              </Link>
            )}
          </nav>
          
          <div className="px-4 mt-auto border-t pt-4">
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
                <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="cursor-pointer">Ubah Password</DropdownMenuItem>
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
          </div>
        </div>
      </aside>

      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </>
  );
}
