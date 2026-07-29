"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";

interface SkPdfButtonProps {
  spb: any; // SPB Data
  className?: string;
}

export function SkPdfButton({ spb, className }: SkPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Initialize PDF (Portrait, A4)
      const doc = new jsPDF("p", "pt", "a4");
      
      // Constants
      const margin = 40;
      const pageWidth = doc.internal.pageSize.width;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = 40;

      // 1. HEADER (KOP SURAT)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("TIM PELAYANAN DANA SOSIAL PAROKI (TPDSP)", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 18;
      
      doc.setFontSize(12);
      doc.text("Gereja Katolik Santo Ignatius Magelang", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 15;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Jl. P. Senopati No.18, Magelang Tengah, Kota Magelang", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 20;

      // Draw horizontal line
      doc.setLineWidth(1.5);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 30;

      // 2. TITLE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("SURAT KEPUTUSAN PEMBERIAN BANTUAN", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 15;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Nomor: ${spb.nomorSpb}`, pageWidth / 2, cursorY, { align: "center" });
      cursorY += 40;

      // 3. BODY CONTENT
      doc.setFontSize(11);
      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Berdasarkan hasil verifikasi dan persetujuan yang telah dilakukan, bersama ini kami memutuskan untuk:`, margin, cursorY, { maxWidth: contentWidth, align: "justify" });
      cursorY += 30;

      doc.setFont("helvetica", "bold");
      doc.text("MENYETUJUI", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 30;
      
      doc.setFont("helvetica", "normal");
      doc.text("Pemberian bantuan dana paroki kepada:", margin, cursorY);
      cursorY += 20;

      // Beneficiary Data
      const labelX = margin + 20;
      const valueX = margin + 120;
      
      const subjekName = spb.kpsData?.namaKepalaKeluarga || spb.umkmData?.namaPemilik || "-";
      const subjekIdent = spb.kpsData ? `KPS (${spb.kpsData.nikEncrypted ? 'NIK Terverifikasi' : '-'})` : 
                          spb.umkmData ? `UMKM (${spb.umkmData.namaUsaha})` : "-";

      doc.text("Nama", labelX, cursorY); doc.text(`: ${subjekName}`, valueX, cursorY); cursorY += 20;
      doc.text("Lingkungan", labelX, cursorY); doc.text(`: ${spb.lingkungan?.namaLingkungan || "-"}`, valueX, cursorY); cursorY += 20;
      doc.text("Kategori", labelX, cursorY); doc.text(`: ${subjekIdent}`, valueX, cursorY); cursorY += 20;
      doc.text("Jenis Bantuan", labelX, cursorY); doc.text(`: ${spb.kategoriBantuan}`, valueX, cursorY); cursorY += 30;

      // Financial Data
      const danaDisetujui = spb.danaParokiApproved !== null ? Number(spb.danaParokiApproved) : Number(spb.danaParokiRequested);
      const formattedDana = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(danaDisetujui);

      doc.setFont("helvetica", "bold");
      doc.text(`Sebesar: ${formattedDana}`, margin, cursorY);
      cursorY += 30;
      
      doc.setFont("helvetica", "normal");
      doc.text(`Dana tersebut akan diambil dari akun ${spb.intensiAccount?.kodeAccount || '-'} (${spb.intensiAccount?.namaIntensi || '-'}).`, margin, cursorY, { maxWidth: contentWidth, align: "justify" });
      cursorY += 30;

      doc.text("Surat keputusan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.", margin, cursorY, { maxWidth: contentWidth, align: "justify" });
      cursorY += 50;

      // 4. SIGNATURES & QR CODE
      // Signatures layout
      const leftCol = margin;
      const rightCol = pageWidth - margin - 150;
      
      doc.text(`Magelang, ${today}`, rightCol, cursorY);
      cursorY += 20;
      
      doc.text("Mengetahui,", leftCol, cursorY);
      doc.text("Mengesahkan,", rightCol, cursorY);
      cursorY += 15;

      doc.text("Ketua TPDSP", leftCol, cursorY);
      doc.text("Romo Paroki", rightCol, cursorY);
      
      // QR Code Generation
      const qrData = `${process.env.NEXT_PUBLIC_APP_URL || 'https://portal-ignatius.vercel.app'}/verify/sk/${spb.id}-${Date.now()}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });
        // Place QR in the middle of signatures
        doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 35, cursorY - 10, 70, 70);
      } catch (e) {
        console.error("Gagal generate QR", e);
      }
      
      cursorY += 70; // space for signature/QR

      doc.setFont("helvetica", "bold");
      doc.text("(...................................)", leftCol, cursorY);
      doc.text("(...................................)", rightCol, cursorY);
      
      // 5. FOOTER
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`Dokumen ini dicetak secara otomatis dari sistem Portal Ignatius pada ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, doc.internal.pageSize.height - 30, { align: "center" });
      
      // Save the PDF
      const sanitizedName = spb.nomorSpb.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`SK_${sanitizedName}.pdf`);
      
    } catch (error) {
      console.error("Gagal mencetak PDF:", error);
      alert("Terjadi kesalahan saat membuat dokumen PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generatePDF} 
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Printer className="h-4 w-4 mr-2" />
      )}
      Cetak SK
    </Button>
  );
}
