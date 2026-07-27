"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { deleteIntensiAction } from "./actions";
import { EditIntensiDialog } from "./edit-intensi-dialog";

export function IntensiTable({ accounts }: { accounts: any[] }) {
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus Akun Intensi ini? Data yang terhapus tidak dapat dikembalikan.")) {
      const result = await deleteIntensiAction(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Akun</TableHead>
            <TableHead>Nama Intensi</TableHead>
            <TableHead className="text-right">Saldo Saat Ini</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                Belum ada data Akun Intensi.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((acc) => (
              <TableRow key={acc.id}>
                <TableCell className="font-medium">{acc.kodeAccount}</TableCell>
                <TableCell className="font-semibold">{acc.namaIntensi}</TableCell>
                <TableCell className="text-right text-green-600 font-semibold">
                  {formatRupiah(parseFloat(acc.saldo))}
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  <EditIntensiDialog intensi={acc} />
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(acc.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
