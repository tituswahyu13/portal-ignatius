import { db as prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { getLingkunganRestriction, hasPermission } from "@/lib/auth/permissions";
import Link from "next/link";
import { Landmark, FileText, Users, Store, ArrowRight } from "lucide-react";

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

  const canReadKeuangan = (await hasPermission("INTENSI_READ")) || (await hasPermission("MUTASI_READ"));

  let totalKas = 0;
  let intensiAccountsLength = 0;

  if (canReadKeuangan) {
    const intensiAccounts = await prisma.intensiAccount.findMany();
    totalKas = intensiAccounts.reduce((acc, curr) => acc + parseFloat(curr.saldo.toString()), 0);
    intensiAccountsLength = intensiAccounts.length;
  }

  const scopeText = restriction.restricted ? "Lingkungan Anda" : "Seluruh Lingkungan";

  return (
    <div className="p-8">
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
    </div>
  );
}
