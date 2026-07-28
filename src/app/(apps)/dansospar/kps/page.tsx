import { getLingkungan } from "@/lib/data/users";
import { getKpsData } from "./actions";
import { CreateKpsDialog } from "./create-kps-dialog";
import { KpsTable } from "./kps-table";
import { hasPermission, getLingkunganRestriction } from "@/lib/auth/permissions";
import { Unauthorized } from "@/components/unauthorized";

export const dynamic = "force-dynamic";

export default async function KpsManagementPage() {
  const allowed = await hasPermission("KPS_READ");
  if (!allowed) {
    return <Unauthorized />;
  }
  
  const canWrite = await hasPermission("KPS_UPDATE");
  const canDelete = await hasPermission("KPS_DELETE");
  const restriction = await getLingkunganRestriction();

  const lingkungan = await getLingkungan();
  const kpsData = await getKpsData();

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

      <KpsTable 
        kpsData={kpsData} 
        lingkungan={lingkungan}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  );
}
