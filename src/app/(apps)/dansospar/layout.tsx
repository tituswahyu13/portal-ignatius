import { ReactNode } from "react";
import { DanSosParSidebar } from "./dansospar-sidebar";
import { hasPermission, getCurrentUser } from "@/lib/auth/permissions";

export default async function DanSosParLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const userName = user?.name || "Pengguna";
  const roleName = user?.userRoles?.[0]?.role?.name || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  const canReadKps = await hasPermission("KPS_READ");
  const canReadUmkm = await hasPermission("UMKM_READ");
  const canReadSpb = await hasPermission("SPB_READ");
  const canReadKeuangan = (await hasPermission("INTENSI_READ")) || (await hasPermission("MUTASI_READ"));

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Client-side Sidebar Component */}
      <DanSosParSidebar 
        canReadKps={canReadKps}
        canReadUmkm={canReadUmkm}
        canReadSpb={canReadSpb}
        canReadKeuangan={canReadKeuangan}
        userName={userName}
        roleName={roleName}
        initials={initials}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
