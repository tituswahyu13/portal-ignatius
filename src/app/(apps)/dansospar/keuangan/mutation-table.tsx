"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function MutationTable({ mutations }: { mutations: any[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Akun Intensi</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Sumber / Ref</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mutations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                Belum ada riwayat transaksi mutasi.
              </TableCell>
            </TableRow>
          ) : (
            mutations.map((mut) => (
              <TableRow key={mut.id}>
                <TableCell className="whitespace-nowrap">
                  <div>
                    {new Date(mut.transactionDate).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                  {mut.creator?.name && <div className="text-xs text-muted-foreground mt-1">oleh {mut.creator.name}</div>}
                </TableCell>
                <TableCell className="font-medium">
                  {mut.intensiAccount.kodeAccount}
                </TableCell>
                <TableCell>
                  {mut.type === "IN" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">MASUK</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">KELUAR</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold">{mut.sourceType}</div>
                  {mut.referenceId && <div className="text-xs text-muted-foreground">Ref: {mut.referenceId}</div>}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={mut.description}>
                  {mut.description}
                </TableCell>
                <TableCell className={`text-right font-semibold ${mut.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                  {mut.type === "IN" ? "+" : "-"}{formatRupiah(parseFloat(mut.amount))}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
