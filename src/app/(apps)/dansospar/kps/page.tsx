import { getLingkungan } from "@/lib/data/users";
import { getKpsData } from "./actions";
import { CreateKpsDialog } from "./create-kps-dialog";
import { KpsTable } from "./kps-table";
import { hasPermission, getLingkunganRestriction } from "@/lib/auth/permissions";
import { Unauthorized } from "@/components/unauthorized";

export const dynamic = "force-dynamic";

export default async function KpsManagementPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const allowed = await hasPermission("KPS_READ");
  if (!allowed) {
    return <Unauthorized />;
  }
  
  const canWrite = await hasPermission("KPS_UPDATE");
  const canDelete = await hasPermission("KPS_DELETE");
  const restriction = await getLingkunganRestriction();

  const lingkungan = await getLingkungan();
  const kpsData = await getKpsData(searchParams.search, searchParams.lingkunganId);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Data KPS</h2>
          <p className="text-muted-foreground">
            Kelola data Keluarga Pra-Sejahtera (KPS). Data KTP dan KK dienkripsi secara aman.
          </p>
        </div>
        <CreateKpsDialog 
          lingkungan={lingkungan} 
          restriction={restriction}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Data KPS</h3>
          </div>
          <div className="text-2xl font-bold">{kpsData.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Keluarga terdaftar</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Status Sejahtera</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {kpsData.filter(k => k.statusKeluarga === "Sejahtera").length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sesuai hasil pembobotan skor</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Status Prasejahtera</h3>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {kpsData.filter(k => k.statusKeluarga === "Prasejahtera").length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sesuai hasil pembobotan skor</p>
        </div>
      </div>

      <KpsTable 
        kpsData={kpsData} 
        lingkungan={lingkungan}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  );
}
