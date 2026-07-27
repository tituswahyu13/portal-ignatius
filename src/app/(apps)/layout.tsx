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

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Sidebar Nav (Desktop) / Top Nav (Mobile) */}
      <aside className="flex w-full flex-col border-b bg-card md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-bold tracking-tight text-primary">
            Portal Apps
          </h1>
        </div>
        <div className="flex flex-1 flex-col justify-between py-4">
          <nav className="flex flex-col gap-1 px-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Portal
            </Link>
            <div className="my-4 border-t" />
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
              Modul Aktif
            </div>
            <Link
              href="/usermanagement"
              className="flex items-center gap-3 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                👥
              </div>
              Manajemen User
            </Link>
          </nav>
          
          <div className="px-4 mt-auto border-t pt-4">
             <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground leading-none">Admin</span>
                  <span className="text-xs text-muted-foreground mt-1">Super Admin</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
