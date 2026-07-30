import { db as prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { getLingkunganRestriction, hasPermission } from "@/lib/auth/permissions";
import Link from "next/link";
import { Landmark, FileText, Users, Store, ArrowRight, Wallet } from "lucide-react";
import { DashboardChart } from "@/components/spb/dashboard-chart";

export const dynamic = "force-dynamic";

export default async function DanSosParDashboard() {
  const restriction = await getLingkunganRestriction();
  const whereLingkungan = restriction.restricted ? { lingkunganId: restriction.lingkunganId } : {};

  const kpsCount = await prisma.kpsData.count({
    where: whereLingkungan
  });
  const umkmCount = await prisma.umkmData.count({
    where: whereLingkungan
  });
  const spbCount = await prisma.spbRequest.count({
    where: { status: "SUBMITTED", ...whereLingkungan }
  });

  const routineSpbs = await prisma.recurringSpb.findMany({
    where: { isActive: true, ...(restriction.restricted ? { kpsData: { lingkunganId: restriction.lingkunganId } } : {}) },
    select: { nominalBantuan: true }
  });
  const activeRoutineCount = routineSpbs.length;
  const estimatedRoutineCost = routineSpbs.reduce((acc, curr) => acc + parseFloat(curr.nominalBantuan.toString()), 0);

  const canReadKeuangan = (await hasPermission("INTENSI_READ")) || (await hasPermission("MUTASI_READ"));

  let totalKas = 0;
  let intensiAccountsLength = 0;

  if (canReadKeuangan) {
    const intensis = await prisma.intensiAccount.findMany({
      select: { saldo: true }
    });
    totalKas = intensis.reduce((acc, curr) => acc + parseFloat(curr.saldo.toString()), 0);
    intensiAccountsLength = intensis.length;
  }

  // Calculate Chart Data (6 months)
  const allRealizedSpbs = await prisma.spbRequest.findMany({
    where: { status: "REALIZED", ...whereLingkungan },
    select: { submittedAt: true, nomorSpb: true, danaParokiApproved: true, danaParokiRequested: true }
  });

  const chartDataRaw: Record<string, { regular: number, rutin: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString("id-ID", { month: "short", year: "2-digit" });
    chartDataRaw[monthName] = { regular: 0, rutin: 0 };
  }

  allRealizedSpbs.forEach(spb => {
    if (!spb.submittedAt) return;
    const monthName = new Date(spb.submittedAt).toLocaleString("id-ID", { month: "short", year: "2-digit" });
    if (chartDataRaw[monthName]) {
      const amount = Number(spb.danaParokiApproved || spb.danaParokiRequested || 0);
      if (spb.nomorSpb && spb.nomorSpb.includes("-RUTIN")) {
        chartDataRaw[monthName].rutin += amount;
      } else {
        chartDataRaw[monthName].regular += amount;
      }
    }
  });

  const chartData = Object.keys(chartDataRaw).map(key => ({
    name: key,
    regular: chartDataRaw[key].regular,
    rutin: chartDataRaw[key].rutin
  }));

  const scopeText = restriction.restricted ? "Lingkungan Anda" : "Seluruh Lingkungan";

  return (
    <div className="p-4 md:p-8 space-y-8 pb-16 md:pb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard DanSosPar</h2>
        <p className="text-muted-foreground">
          Ringkasan Dana Sosial Paroki, total saldo intensi, dan statistik pengajuan SPB.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {canReadKeuangan && (
          <Link href="/dansospar/keuangan" className="group block">
            <div className="rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 h-full">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Total Saldo Kas Paroki</h3>
                <Landmark className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{formatRupiah(totalKas)}</div>
                <p className="text-xs text-muted-foreground mt-1">Gabungan dari {intensiAccountsLength} Akun Intensi</p>
              </div>
              <div className="px-6 pb-4">
                <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Buka Keuangan <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        )}

        <Link href="/dansospar/spb" className="group block">
          <div className="rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 h-full">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">SPB Menunggu Approval</h3>
              <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{spbCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{restriction.restricted ? "Dari Lingkungan Anda" : "Butuh review (Global)"}</p>
            </div>
            <div className="px-6 pb-4">
              <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Buka Pengajuan SPB <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/dansospar/spb/rutin" className="group block">
          <div className="rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 h-full">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Beban SPB Rutin (Bulan)</h3>
              <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-orange-600">{formatRupiah(estimatedRoutineCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">Dari {activeRoutineCount} Penerima Aktif {restriction.restricted && "di Lingkungan Anda"}</p>
            </div>
            <div className="px-6 pb-4">
              <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Kelola SPB Rutin <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/dansospar/kps" className="group block">
          <div className="rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 h-full">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Data KPS Terdaftar</h3>
              <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{kpsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{scopeText}</p>
            </div>
            <div className="px-6 pb-4">
              <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Buka Data KPS <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/dansospar/umkm" className="group block">
          <div className="rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 h-full">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Data UMKM Terdaftar</h3>
              <Store className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{umkmCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{scopeText}</p>
            </div>
            <div className="px-6 pb-4">
              <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Buka Data UMKM <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      <DashboardChart data={chartData} />
    </div>
  );
}
