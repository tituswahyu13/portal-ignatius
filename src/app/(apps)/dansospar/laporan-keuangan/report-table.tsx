"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";

export function ReportTable({ 
  mutations, 
  accounts 
}: { 
  mutations: any[];
  accounts: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [intensiId, setIntensiId] = useState(searchParams.get("intensiId") || "ALL");
  const [sourceType, setSourceType] = useState(searchParams.get("sourceType") || "ALL");
  const [type, setType] = useState(searchParams.get("type") || "ALL");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (intensiId && intensiId !== "ALL") params.set("intensiId", intensiId);
    if (sourceType && sourceType !== "ALL") params.set("sourceType", sourceType);
    if (type && type !== "ALL") params.set("type", type);

    router.push(`/dansospar/laporan-keuangan?${params.toString()}`);
  };

  const exportToCsv = () => {
    // Basic CSV Export
    const headers = ["Tanggal", "Akun Intensi", "Jenis", "Sumber", "Nominal", "Keterangan", "Dibuat Oleh"];
    
    const rows = mutations.map(mut => [
      new Date(mut.transactionDate).toLocaleString("id-ID").replace(/,/g, ''),
      mut.intensiAccount.namaIntensi,
      mut.type === "IN" ? "Pemasukan" : "Pengeluaran",
      mut.sourceType,
      mut.type === "IN" ? mut.amount : `-${mut.amount}`,
      `"${mut.description?.replace(/"/g, '""') || ''}"`,
      mut.creator?.name || "System"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_keuangan_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-card border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="start-date">Dari Tanggal</Label>
          <Input 
            id="start-date" 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-date">Sampai Tanggal</Label>
          <Input 
            id="end-date" 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
        <div className="space-y-1.5">
          <Label>Akun Kas</Label>
          <Select value={intensiId} onValueChange={setIntensiId}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Akun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Akun</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.namaIntensi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sumber Dana</Label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Sumber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Sumber</SelectItem>
              <SelectItem value="KOLEKTE">Kolekte</SelectItem>
              <SelectItem value="PERSEMBAHAN_BULANAN">Persembahan Bulanan</SelectItem>
              <SelectItem value="APP">APP</SelectItem>
              <SelectItem value="DONASI">Donasi</SelectItem>
              <SelectItem value="SPB_REALIZATION">Pencairan SPB</SelectItem>
              <SelectItem value="INTER_TRANSFER">Transfer Antar Kas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Jenis Transaksi</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis</SelectItem>
              <SelectItem value="IN">Pemasukan (IN)</SelectItem>
              <SelectItem value="OUT">Pengeluaran (OUT)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleFilter} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={exportToCsv} disabled={mutations.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Ekspor CSV
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-md border bg-card">
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
                  Tidak ada data yang sesuai dengan filter.
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
                    {mut.intensiAccount.kodeAccount} <span className="text-xs font-normal text-muted-foreground">({mut.intensiAccount.namaIntensi})</span>
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
    </div>
  );
}
