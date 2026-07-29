import { ReactNode } from "react";
import { UserManagementSidebar } from "./usermanagement-sidebar";
import { getCurrentUser } from "@/lib/auth/permissions";

export default async function UserManagementLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const userName = user?.name || "Pengguna";
  const roleName = user?.userRoles?.[0]?.role?.name || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <UserManagementSidebar userName={userName} roleName={roleName} initials={initials} />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
