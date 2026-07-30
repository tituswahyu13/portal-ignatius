import { db as prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddRecurringDialog } from "./add-dialog";
import { getKpsForRoutineSpb } from "./actions";
import { hasPermission } from "@/lib/auth/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { GenerateRoutineButton } from "./generate-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogTab } from "./audit-log-tab";
import { getRoutineAuditLogs } from "./actions";

export const dynamic = "force-dynamic";

export default async function SpbRutinPage() {
  const allowed = await hasPermission("SPB_RUTIN_MANAGE");
  if (!allowed) return <Unauthorized />;

  // 1. Get Data
  const routines = await prisma.recurringSpb.findMany({
    include: {
      kpsData: { include: { lingkungan: true } },
      intensiAccount: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const kpsList = await getKpsForRoutineSpb();
  const intensiList = await prisma.intensiAccount.findMany();

  // 2. Check if already generated this month
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const activeRoutines = routines.filter(r => r.isActive);
  const ungeneratedRoutines = activeRoutines.filter(r => r.lastGeneratedMonth !== currentMonthStr);
  const canGenerate = ungeneratedRoutines.length > 0;

  // 3. Get Audit Logs
  const auditLogs = await getRoutineAuditLogs();

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen SPB Rutin</h2>
          <p className="text-muted-foreground">
            Daftar umat yang menerima bantuan secara berkala setiap bulannya.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddRecurringDialog kpsList={kpsList} intensiList={intensiList} />
          
          <GenerateRoutineButton 
            canGenerate={canGenerate} 
            monthStr={currentMonthStr} 
            ungeneratedCount={ungeneratedRoutines.length} 
          />
        </div>
      </div>

      <Tabs defaultValue="penerima" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="penerima">Daftar Penerima</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Generate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="penerima">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Penerima Bantuan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Nominal Bulanan</TableHead>
                  <TableHead>Sumber Dana</TableHead>
                  <TableHead>Terakhir Dibuat</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Belum ada KPS yang terdaftar sebagai penerima bantuan rutin.
                    </TableCell>
                  </TableRow>
                ) : (
                  routines.map((routine) => (
                    <TableRow key={routine.id.toString()}>
                      <TableCell>
                        <div className="font-medium">{routine.kpsData.namaKepalaKeluarga}</div>
                        <div className="text-xs text-muted-foreground">{routine.kpsData.lingkungan.namaLingkungan}</div>
                      </TableCell>
                      <TableCell>{routine.kategoriBantuan}</TableCell>
                      <TableCell className="font-medium">
                        {formatRupiah(parseFloat(routine.nominalBantuan.toString()))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{routine.intensiAccount.kodeAccount}</Badge>
                      </TableCell>
                      <TableCell>
                        {routine.lastGeneratedMonth || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {routine.isActive ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Nonaktif</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="riwayat">
          <AuditLogTab logs={auditLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
