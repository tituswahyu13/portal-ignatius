import { getIntensiAccounts, getLaporanKeuangan } from "./actions";
import { ReportTable } from "./report-table";
import { formatRupiah } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LaporanKeuanganPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const accounts = await getIntensiAccounts();
  const mutations = await getLaporanKeuangan({
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    intensiId: searchParams.intensiId,
    sourceType: searchParams.sourceType,
    type: searchParams.type,
  });

  // Calculate summaries
  const totalPemasukan = mutations
    .filter(m => m.type === "IN")
    .reduce((sum, m) => sum + parseFloat(m.amount), 0);
    
  const totalPengeluaran = mutations
    .filter(m => m.type === "OUT")
    .reduce((sum, m) => sum + parseFloat(m.amount), 0);

  const netBalance = totalPemasukan - totalPengeluaran;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground">
            Rekapitulasi transaksi keuangan Kas Intensi Paroki berdasarkan filter.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Pemasukan</h3>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatRupiah(totalPemasukan)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Pada periode yang dipilih</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Pengeluaran</h3>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatRupiah(totalPengeluaran)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Pada periode yang dipilih</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Surplus / (Defisit)</h3>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-primary" : "text-red-600"}`}>
            {formatRupiah(netBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Berdasarkan filter</p>
        </div>
      </div>

      <ReportTable accounts={accounts} mutations={mutations} />
    </div>
  );
}
