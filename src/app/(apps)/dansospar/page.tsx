import { db as prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DanSosParDashboard() {
  const kpsCount = await prisma.kpsData.count();
  const umkmCount = await prisma.umkmData.count();
  const spbCount = await prisma.spbRequest.count({
    where: { status: "SUBMITTED" }
  });

  const intensiAccounts = await prisma.intensiAccount.findMany();
  const totalKas = intensiAccounts.reduce((acc, curr) => acc + parseFloat(curr.saldo.toString()), 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard DanSosPar</h2>
        <p className="text-muted-foreground">
          Ringkasan Dana Sosial Paroki, total saldo intensi, dan statistik pengajuan SPB.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Saldo Kas</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{formatRupiah(totalKas)}</div>
            <p className="text-xs text-muted-foreground mt-1">Gabungan dari {intensiAccounts.length} Akun Intensi</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">SPB Menunggu Approval</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{spbCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Butuh review</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Data KPS Terdaftar</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{kpsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Seluruh Lingkungan</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Data UMKM Terdaftar</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{umkmCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Seluruh Lingkungan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
