import { ReactNode } from "react";
import { UserManagementSidebar } from "./usermanagement-sidebar";

export default function UserManagementLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <UserManagementSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
