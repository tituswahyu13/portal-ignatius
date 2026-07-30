"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AuditLogTab({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg bg-card mt-4">
        Belum ada riwayat generate SPB rutin massal.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[180px]">Waktu Eksekusi</TableHead>
            <TableHead>Bulan Sasaran</TableHead>
            <TableHead>Dieksekusi Oleh</TableHead>
            <TableHead>Keterangan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id.toString()}>
              <TableCell className="font-medium whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{log.entityId}</Badge>
              </TableCell>
              <TableCell>{log.user?.name || "Sistem"}</TableCell>
              <TableCell className="text-muted-foreground">{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
