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
import { Download, Search, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const exportToPdf = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("Buku Kas - Laporan Keuangan", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 28);
    
    if (startDate || endDate) {
      doc.text(`Periode: ${startDate || "-"} s/d ${endDate || "-"}`, 14, 34);
    }
    
    // Calculations for running balance (Saldo Berjalan)
    let runningBalance = 0;
    
    const tableData = mutations.map(mut => {
      const isIncome = mut.type === "IN";
      const nominal = parseFloat(mut.amount);
      
      runningBalance += isIncome ? nominal : -nominal;
      
      return [
        new Date(mut.transactionDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }),
        mut.intensiAccount.namaIntensi,
        isIncome ? "Pemasukan" : "Pengeluaran",
        mut.sourceType,
        mut.description || "-",
        isIncome ? formatRupiah(nominal) : "-",
        !isIncome ? formatRupiah(nominal) : "-",
        formatRupiah(runningBalance)
      ];
    });
    
    autoTable(doc, {
      startY: (startDate || endDate) ? 40 : 34,
      head: [['Tanggal', 'Akun', 'Jenis', 'Sumber', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Saldo']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    doc.save(`buku_kas_${new Date().getTime()}.pdf`);
  };

  const exportToExcel = () => {
    let runningBalance = 0;
    
    const excelData = mutations.map(mut => {
      const isIncome = mut.type === "IN";
      const nominal = parseFloat(mut.amount);
      
      runningBalance += isIncome ? nominal : -nominal;
      
      return {
        "Tanggal": new Date(mut.transactionDate).toLocaleString("id-ID"),
        "Akun Intensi": mut.intensiAccount.namaIntensi,
        "Jenis": isIncome ? "Pemasukan" : "Pengeluaran",
        "Sumber": mut.sourceType,
        "Keterangan": mut.description || "-",
        "Pemasukan (Rp)": isIncome ? nominal : 0,
        "Pengeluaran (Rp)": !isIncome ? nominal : 0,
        "Saldo (Rp)": runningBalance,
        "Diinput Oleh": mut.creator?.name || "Sistem"
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_Keuangan");
    
    // Auto-size columns slightly
    const wscols = [
      {wch: 20}, {wch: 25}, {wch: 15}, {wch: 20}, {wch: 35}, 
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}
    ];
    worksheet['!cols'] = wscols;
    
    XLSX.writeFile(workbook, `buku_kas_${new Date().getTime()}.xlsx`);
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={exportToPdf} disabled={mutations.length === 0} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
          <FileText className="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button variant="outline" onClick={exportToExcel} disabled={mutations.length === 0} className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
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
