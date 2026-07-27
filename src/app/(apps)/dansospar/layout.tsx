import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Store, FileText, Wallet } from "lucide-react";

export default function DanSosParLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar DanSosPar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b bg-background">
          <h2 className="font-semibold text-lg">DanSosPar</h2>
          <p className="text-xs text-muted-foreground">Dana Sosial Paroki</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <SidebarItem href="/dansospar" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          
          <div className="pt-4 pb-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Master Data</p>
          </div>
          <SidebarItem href="/dansospar/kps" icon={<Users size={20} />} label="Data KPS" />
          <SidebarItem href="/dansospar/umkm" icon={<Store size={20} />} label="Data UMKM" />
          
          <div className="pt-4 pb-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Manajemen</p>
          </div>
          <SidebarItem href="/dansospar/spb" icon={<FileText size={20} />} label="Pengajuan SPB" />
          <SidebarItem href="/dansospar/keuangan" icon={<Wallet size={20} />} label="Kas & Intensi" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}

function SidebarItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80"
    >
      {icon}
      {label}
    </Link>
  );
}
