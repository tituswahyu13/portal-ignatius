import { ReactNode } from "react";
import { DataUmatSidebar } from "./dataumat-sidebar";

export default function DataUmatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <DataUmatSidebar />
      <div className="flex-1 overflow-y-auto">
        <main className="container max-w-6xl py-6 mx-auto px-4 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
