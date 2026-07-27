"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Store, FileText, Wallet, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DanSosParSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check window size on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change in mobile
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  // Desktop defaults to open, mobile defaults to closed
  const showSidebar = isMobile ? isOpen : true;

  return (
    <>
      {/* Mobile Toggle Button (Only visible on mobile when sidebar is closed) */}
      {isMobile && !isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 rounded-full shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 border-r bg-muted/20 
          transition-transform duration-300 ease-in-out
          ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div>
            <h2 className="font-semibold text-lg text-primary">DanSosPar</h2>
            <p className="text-xs text-muted-foreground">Dana Sosial Paroki</p>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <SidebarItem href="/dansospar" icon={<LayoutDashboard size={20} />} label="Dashboard" currentPath={pathname} />
          
          <div className="pt-4 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Master Data</p>
          </div>
          <SidebarItem href="/dansospar/kps" icon={<Users size={20} />} label="Data KPS" currentPath={pathname} />
          <SidebarItem href="/dansospar/umkm" icon={<Store size={20} />} label="Data UMKM" currentPath={pathname} />
          
          <div className="pt-4 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manajemen</p>
          </div>
          <SidebarItem href="/dansospar/spb" icon={<FileText size={20} />} label="Pengajuan SPB" currentPath={pathname} />
          <SidebarItem href="/dansospar/keuangan" icon={<Wallet size={20} />} label="Kas & Intensi" currentPath={pathname} />
        </nav>

        <div className="p-4 border-t bg-background">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground rounded-md transition-colors"
          >
            <ChevronLeft size={16} />
            Kembali ke Portal
          </Link>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ href, icon, label, currentPath }: { href: string; icon: ReactNode; label: string; currentPath: string }) {
  // Check if current path matches href exactly or is a sub-path
  const isActive = currentPath === href || currentPath.startsWith(`${href}/`);
  
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors 
        ${isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "hover:bg-primary/10 hover:text-primary text-foreground/80"}
      `}
    >
      {icon}
      {label}
    </Link>
  );
}
