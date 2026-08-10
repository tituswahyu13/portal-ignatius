import { Suspense } from "react";
import { getLingkungans } from "./actions";
import { CreateLingkunganDialog } from "./create-lingkungan-dialog";
import { LingkunganTable } from "./lingkungan-table";
import { hasPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export default async function LingkunganPage() {
  const canAccess = await hasPermission("GLOBAL_SETTINGS_MANAGE");
  if (!canAccess) {
    // If they don't have global access, they shouldn't manage Lingkungan master data
    redirect("/");
  }

  const lingkungans = await getLingkungans();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Lingkungan</h1>
          <p className="text-muted-foreground">
            Kelola master data lingkungan dan wilayah.
          </p>
        </div>
        <CreateLingkunganDialog />
      </div>

      <LingkunganTable lingkungans={lingkungans} />
    </div>
  );
}
