import { getLingkungan } from "@/lib/data/users";
import { getUmkmData } from "./actions";
import { CreateUmkmDialog } from "./create-umkm-dialog";
import { UmkmTable } from "./umkm-table";

export const dynamic = "force-dynamic";

export default async function UmkmManagementPage() {
  const lingkungan = await getLingkungan();
  const umkmData = await getUmkmData();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Data UMKM</h2>
          <p className="text-muted-foreground">
            Kelola pendaftaran UMKM. Sistem akan otomatis menentukan kelayakan berdasarkan Aset dan Omset.
          </p>
        </div>
        <CreateUmkmDialog lingkungan={lingkungan} />
      </div>

      <UmkmTable umkmData={umkmData} lingkungan={lingkungan} />
    </div>
  );
}
