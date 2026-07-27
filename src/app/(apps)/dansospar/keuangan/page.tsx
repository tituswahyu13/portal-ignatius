import { getIntensiAccounts, getMutations } from "./actions";
import { CreateIntensiDialog } from "./create-intensi-dialog";
import { IntensiTable } from "./intensi-table";
import { CreateMutationDialog } from "./create-mutation-dialog";
import { MutationTable } from "./mutation-table";

export const dynamic = "force-dynamic";

export default async function KeuanganManagementPage() {
  const accounts = await getIntensiAccounts();
  const mutations = await getMutations();

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Keuangan & Intensi</h2>
          <p className="text-muted-foreground">
            Kelola Master Akun Intensi dan Riwayat Transaksi (Ledger) Dana Sosial Paroki.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Kolom Kiri: Master Akun Intensi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Master Akun Intensi</h3>
            <CreateIntensiDialog />
          </div>
          <div className="bg-card rounded-lg shadow-sm">
            <IntensiTable accounts={accounts} />
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Transaksi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Buku Besar (Ledger)</h3>
            <CreateMutationDialog accounts={accounts} />
          </div>
          <div className="bg-card rounded-lg shadow-sm">
            <MutationTable mutations={mutations} />
          </div>
        </div>
      </div>
    </div>
  );
}
