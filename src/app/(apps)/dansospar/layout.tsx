import { ReactNode } from "react";
import { DanSosParSidebar } from "./dansospar-sidebar";

export default function DanSosParLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Client-side Sidebar Component */}
      <DanSosParSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
