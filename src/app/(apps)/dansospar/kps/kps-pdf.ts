"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

// Kriteria Indikator KPS
const INDICATOR_DETAILS: Record<string, { label: string; bobot: string; desc: Record<number, string> }> = {
  skorPekerjaan: {
    label: "Pekerjaan / Pemasukan",
    bobot: "25%",
    desc: {
      1: "Serabutan, tidak menentu, atau bergantung belas kasihan orang lain.",
      2: "Pemasukan rutin bulanan ada, namun pas-pasan (habis bulanan).",
      3: "Pemasukan stabil / punya usaha berjalan, mampu menabung rutin."
    }
  },
  skorPangan: {
    label: "Kebutuhan Pangan",
    bobot: "20%",
    desc: {
      1: "Sering kesulitan makan harian (hanya mampu 1-2 kali sehari).",
      2: "Makan 3 kali sehari terpenuhi, namun menu seadanya (rendah gizi).",
      3: "Kebutuhan pangan harian sangat terjamin dan bergizi seimbang."
    }
  },
  skorSandang: {
    label: "Sandang (Pakaian)",
    bobot: "10%",
    desc: {
      1: "Baju sangat terbatas/lusuh, mengandalkan donasi baju bekas.",
      2: "Mampu membeli pakaian baru hanya pada momen tertentu (hemat).",
      3: "Kebutuhan sandang terpenuhi dengan sangat baik."
    }
  },
  skorPapan: {
    label: "Tempat Tinggal (Papan)",
    bobot: "15%",
    desc: {
      1: "Menumpang, tidak layak huni, atau rawan sengketa / gusur.",
      2: "Rumah warisan bersama (belum dibagi) atau sewa/kos layak.",
      3: "Rumah milik sendiri yang sah dan layak huni."
    }
  },
  skorKesehatan: {
    label: "Kesehatan & Jaminan",
    bobot: "15%",
    desc: {
      1: "Ada sakit kronis/lansia rentan, tanpa BPJS, pengobatan tersendat.",
      2: "Memiliki BPJS aktif (Kelas 3/PBI), kondisi umum relatif sehat.",
      3: "Proteksi kesehatan baik (BPJS Kelas 1/2 atau asuransi swasta)."
    }
  },
  skorPendidikan: {
    label: "Pendidikan Anak",
    bobot: "10%",
    desc: {
      0: "Tidak ada anak usia sekolah / kuliah (N/A).",
      1: "Menunggak SPP/biaya, terancam putus sekolah karena ekonomi.",
      2: "Sekolah lancar, namun sering kesulitan saat ujian/buku.",
      3: "Seluruh biaya pendidikan terbayar lancar tanpa kendala."
    }
  },
  skorSosial: {
    label: "Sosial Komunitas",
    bobot: "5%",
    desc: {
      1: "Tidak pernah mampu membayar iuran lingkungan karena ekonomi.",
      2: "Kadang-kadang membayar iuran jika ada rezeki berlebih.",
      3: "Rutin membayar iuran lingkungan, kolekte, dan donatur aktif."
    }
  }
};

/**
 * 1. Cetak Lembar Evaluasi KPS Individu (A4 Portrait)
 */
export async function exportSingleKpsPdf(kps: any) {
  try {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = 35;

    // --- KOP SURAT PAROKI ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TIM PELAYANAN DANA SOSIAL PAROKI (TPDSP)", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 16;

    doc.setFontSize(12);
    doc.text("Gereja Katolik Santo Ignatius Magelang", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Jl. P. Senopati No. 18, Magelang Tengah, Kota Magelang, Jawa Tengah 56117", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 15;

    doc.setLineWidth(1.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
    cursorY += 20;

    // --- JUDUL DOKUMEN ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("LEMBAR HASIL PENILAIAN KELUARGA PRA-SEJAHTERA (KPS)", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const regNo = `No. Registrasi: KPS-${(kps.id || 0).toString().padStart(4, '0')}`;
    doc.text(regNo, pageWidth / 2, cursorY, { align: "center" });
    cursorY += 20;

    // --- INFORMASI KELUARGA ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("A. PROFIL KEPALA KELUARGA", margin, cursorY);
    cursorY += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const col1X = margin + 10;
    const col1ValX = margin + 130;
    const col2X = margin + 270;
    const col2ValX = margin + 370;

    const namaDisplay = kps.umat?.nama || kps.namaKepalaKeluarga || "-";
    const namaBaptis = kps.umat?.namaBaptis ? ` (${kps.umat.namaBaptis})` : "";
    const nikDisplay = kps.nikDecryptedMasked || (kps.umat?.nikMasked) || "-";
    const kkDisplay = (kps.umat?.kkMasked) || "-";
    const lingkunganDisplay = kps.lingkungan?.namaLingkungan || "-";
    const alamatDisplay = kps.umat?.alamat || "-";
    const pekerjaanDisplay = kps.umat?.pekerjaan || "-";
    const noHpDisplay = kps.umat?.noHp || "-";

    // Row 1
    doc.text("Nama Kepala Keluarga", col1X, cursorY);
    doc.text(`: ${namaDisplay}${namaBaptis}`, col1ValX, cursorY);
    doc.text("Lingkungan", col2X, cursorY);
    doc.text(`: ${lingkunganDisplay}`, col2ValX, cursorY);
    cursorY += 15;

    // Row 2
    doc.text("Pekerjaan Pokok", col1X, cursorY);
    doc.text(`: ${pekerjaanDisplay}`, col1ValX, cursorY);
    doc.text("No. Handphone / WA", col2X, cursorY);
    doc.text(`: ${noHpDisplay}`, col2ValX, cursorY);
    cursorY += 15;

    // Row 3
    doc.text("Alamat Lengkap", col1X, cursorY);
    doc.text(`: ${alamatDisplay}`, col1ValX, cursorY, { maxWidth: 380 });
    cursorY += 20;

    // --- HASIL KELAYAKAN (HIGHLIGHT BOX) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("B. HASIL SKORING & KELAYAKAN", margin, cursorY);
    cursorY += 10;

    const isPrasejahtera = kps.statusKeluarga === "Prasejahtera";
    const boxColor = isPrasejahtera ? [254, 242, 242] : [240, 253, 244];
    const borderColor = isPrasejahtera ? [239, 68, 68] : [34, 197, 94];
    const textColor = isPrasejahtera ? [185, 28, 28] : [21, 128, 61];

    doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 38, 4, 4, "FD");

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(11);
    const statusText = (kps.statusKeluarga || "Prasejahtera").toUpperCase();
    doc.text(`STATUS: ${statusText}`, margin + 15, cursorY + 16);

    doc.setFontSize(9);
    doc.text(
      isPrasejahtera
        ? "Memenuhi kriteria penerima bantuan program sosial & pemberdayaan paroki."
        : "Kondisi ekonomi keluarga tergolong stabil dan mandiri.",
      margin + 15,
      cursorY + 28
    );

    // Skor di sisi kanan kotak
    doc.setFontSize(12);
    doc.text(`${kps.persentaseKelayakan}%`, pageWidth - margin - 15, cursorY + 17, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Skor: ${kps.totalSkor} / 21`, pageWidth - margin - 15, cursorY + 28, { align: "right" });

    doc.setTextColor(0);
    cursorY += 50;

    // --- TABEL 7 INDIKATOR PENILAIAN ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("C. RINCIAN SKOR 7 INDIKATOR PEMENUHAN KEBUTUHAN DASAR", margin, cursorY);
    cursorY += 8;

    const indicatorsTableData = Object.entries(INDICATOR_DETAILS).map(([key, info], idx) => {
      const score = Number(kps[key]) || 0;
      const desc = info.desc[score] || (score === 0 ? "Tidak Relevan (N/A)" : "-");
      const scoreBadge = score === 0 ? "N/A" : score === 1 ? "1 (Rentan)" : score === 2 ? "2 (Menengah)" : "3 (Stabil)";
      return [
        (idx + 1).toString(),
        info.label,
        info.bobot,
        scoreBadge,
        desc
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["No", "Indikator Kebutuhan", "Bobot", "Skor", "Kondisi di Lapangan (Hasil Survei)"]],
      body: indicatorsTableData,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: "center",
        fontStyle: "bold"
      },
      bodyStyles: {
        fontSize: 8,
        lineColor: [226, 232, 240]
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 24 },
        1: { cellWidth: 120, fontStyle: "bold" },
        2: { halign: "center", cellWidth: 45 },
        3: { halign: "center", cellWidth: 65, fontStyle: "bold" },
        4: { cellWidth: "auto" }
      }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 20;

    // --- REKOMENDASI TINDAKAN (JIKA ADA KONDISI KRITIS) ---
    if (cursorY + 110 > pageHeight - 40) {
      doc.addPage();
      cursorY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("D. REKOMENDASI TINDAKAN DANSOSPAR:", margin, cursorY);
    cursorY += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const bullets: string[] = [];
    if (kps.skorPangan === 1) bullets.push("Prioritas Program Sembako Bulanan / Darurat (Pangan Kritis).");
    if (kps.skorKesehatan === 1) bullets.push("Bantuan Pembiayaan Kesehatan / Pendaftaran BPJS Kesehatan (Sakit Kronis/Rentan).");
    if (kps.skorPapan === 1) bullets.push("Evaluasi Program Bantuan Tempat Tinggal / Renovasi Rumah Tidak Layak.");
    if (kps.skorPendidikan === 1) bullets.push("Dukungan Beasiswa Pendidikan / Pelunasan SPP Siswa.");
    if (kps.skorPekerjaan === 1) bullets.push("Pemberdayaan Usaha Mikro (Bantuan Modal UMKM Paroki) atau Bimbingan Kerja.");
    if (bullets.length === 0) {
      bullets.push(
        isPrasejahtera
          ? "Keluarga memerlukan pendampingan sosial dan pemantauan kondisi ekonomi berkala dari pengurus lingkungan."
          : "Keluarga dalam kondisi stabil dan mandiri, tidak memerlukan intervensi bantuan darurat."
      );
    }

    bullets.forEach((b) => {
      doc.text(`•  ${b}`, margin + 10, cursorY, { maxWidth: contentWidth - 20 });
      cursorY += 12;
    });

    cursorY += 15;

    // --- TANDA TANGAN & PENGESAHAN ---
    if (cursorY + 90 > pageHeight - 40) {
      doc.addPage();
      cursorY = 40;
    }

    const todayDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const colLeftX = margin + 20;
    const colRightX = pageWidth - margin - 170;

    doc.setFontSize(8);
    doc.text(`Magelang, ${todayDate}`, colRightX, cursorY);
    cursorY += 14;

    doc.text("Petugas / Pengurus Lingkungan,", colLeftX, cursorY);
    doc.text("Mengetahui Tim Dansospar,", colRightX, cursorY);
    cursorY += 12;

    doc.setFont("helvetica", "bold");
    doc.text(`Lingkungan ${lingkunganDisplay}`, colLeftX, cursorY);
    doc.text("Ketua TPDSP Paroki", colRightX, cursorY);

    // QR Code Verifikasi
    try {
      const qrData = `https://portal-ignatius.vercel.app/dansospar/kps?search=${encodeURIComponent(namaDisplay)}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 80 });
      doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 25, cursorY - 10, 50, 50);
    } catch (e) {
      console.error("QR Error", e);
    }

    cursorY += 50;
    doc.setFont("helvetica", "normal");
    doc.text("( .................................................. )", colLeftX, cursorY);
    doc.text("( .................................................. )", colRightX, cursorY);

    // Footer Cetak
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Dicetak otomatis dari Portal Ignatius pada ${new Date().toLocaleString("id-ID")}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    // Simpan PDF
    const safeName = namaDisplay.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Lembar_KPS_${safeName}.pdf`);
  } catch (err) {
    console.error("Gagal export single KPS:", err);
    alert("Gagal mencetak dokumen KPS.");
  }
}

/**
 * 2. Cetak Rekap Daftar KPS Seluruhnya / Per Lingkungan (A4 Landscape)
 */
export async function exportKpsListPdf({
  kpsList,
  lingkunganName,
  searchQuery
}: {
  kpsList: any[];
  lingkunganName?: string;
  searchQuery?: string;
}) {
  try {
    if (!kpsList || kpsList.length === 0) {
      alert("Tidak ada data KPS untuk dicetak.");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 30;
    let cursorY = 35;

    // --- KOP SURAT PAROKI ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TIM PELAYANAN DANA SOSIAL PAROKI (TPDSP)", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 16;

    doc.setFontSize(11);
    doc.text("Gereja Katolik Santo Ignatius Magelang", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 13;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Jl. P. Senopati No. 18, Magelang Tengah, Kota Magelang, Jawa Tengah 56117", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 14;

    doc.setLineWidth(1.2);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 20;

    // --- JUDUL & FILTER ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("REKAPITULASI DATA KELUARGA PRA-SEJAHTERA (KPS)", pageWidth / 2, cursorY, { align: "center" });
    cursorY += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const filterInfo = `Lingkungan: ${lingkunganName || "Semua Lingkungan"}${searchQuery ? ` | Pencarian: "${searchQuery}"` : ""} | Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    doc.text(filterInfo, pageWidth / 2, cursorY, { align: "center" });
    cursorY += 15;

    // --- STATISTIK SINGKAT ---
    const total = kpsList.length;
    const totalPrasejahtera = kpsList.filter(k => k.statusKeluarga === "Prasejahtera").length;
    const totalSejahtera = kpsList.filter(k => k.statusKeluarga === "Sejahtera").length;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Terdaftar: ${total} Keluarga  |  Prasejahtera: ${totalPrasejahtera}  |  Sejahtera: ${totalSejahtera}`, margin, cursorY);
    cursorY += 10;

    // --- TABEL DATA KPS (LANDSCAPE) ---
    const tableRows = kpsList.map((k, index) => {
      const nama = k.umat?.nama || k.namaKepalaKeluarga || "-";
      const namaBaptis = k.umat?.namaBaptis ? ` (${k.umat.namaBaptis})` : "";
      const lingkungan = k.lingkungan?.namaLingkungan || "-";
      const status = k.statusKeluarga || "-";
      const skorPekerjaan = k.skorPekerjaan || 0;
      const skorPangan = k.skorPangan || 0;
      const skorSandang = k.skorSandang || 0;
      const skorPapan = k.skorPapan || 0;
      const skorKesehatan = k.skorKesehatan || 0;
      const skorPendidikan = k.skorPendidikan || 0;
      const skorSosial = k.skorSosial || 0;
      const totalSkor = `${k.totalSkor ?? 0}/21`;
      const persentase = `${k.persentaseKelayakan ?? 0}%`;

      return [
        (index + 1).toString(),
        `${nama}${namaBaptis}`,
        lingkungan,
        status,
        skorPekerjaan.toString(),
        skorPangan.toString(),
        skorSandang.toString(),
        skorPapan.toString(),
        skorKesehatan.toString(),
        skorPendidikan.toString(),
        skorSosial.toString(),
        totalSkor,
        persentase
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: 30, right: 30 },
      tableWidth: "auto",
      head: [
        [
          "No",
          "Kepala Keluarga",
          "Lingkungan",
          "Status Keluarga",
          "Pekerjaan\n(25%)",
          "Pangan\n(20%)",
          "Sandang\n(10%)",
          "Papan\n(15%)",
          "Kesehatan\n(15%)",
          "Pendidikan\n(10%)",
          "Sosial\n(5%)",
          "Total\nSkor",
          "Persentase\nKelayakan"
        ]
      ],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 7,
        halign: "center",
        valign: "middle",
        fontStyle: "bold",
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7,
        lineColor: [226, 232, 240],
        cellPadding: 2.5
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 22 },
        1: { fontStyle: "bold" },
        2: { cellWidth: 75 },
        3: { halign: "center", cellWidth: 70 },
        4: { halign: "center", cellWidth: 54 },
        5: { halign: "center", cellWidth: 42 },
        6: { halign: "center", cellWidth: 46 },
        7: { halign: "center", cellWidth: 42 },
        8: { halign: "center", cellWidth: 55 },
        9: { halign: "center", cellWidth: 55 },
        10: { halign: "center", cellWidth: 40 },
        11: { halign: "center", cellWidth: 38, fontStyle: "bold" },
        12: { halign: "right", cellWidth: 56, fontStyle: "bold" }
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 3) {
          if (data.cell.raw === "Prasejahtera") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "Sejahtera") {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    // Signatures
    let finalY = (doc as any).lastAutoTable.finalY + 25;
    if (finalY + 80 > pageHeight - 30) {
      doc.addPage();
      finalY = 40;
    }

    const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const signLeftX = margin + 40;
    const signRightX = pageWidth - margin - 200;

    doc.setFontSize(8);
    doc.text(`Magelang, ${todayStr}`, signRightX, finalY);
    finalY += 14;

    doc.text("Petugas Pendataan,", signLeftX, finalY);
    doc.text("Mengetahui & Menyetujui,", signRightX, finalY);
    finalY += 12;

    const isSingleLingkungan = lingkunganName && lingkunganName !== "Semua Lingkungan";
    doc.setFont("helvetica", "bold");
    doc.text(
      isSingleLingkungan
        ? `Koordinator DanSosPar ${lingkunganName}`
        : "Koordinator DanSosPar Lingkungan",
      signLeftX,
      finalY
    );
    doc.text("Ketua TPDSP Paroki Santo Ignatius", signRightX, finalY);

    finalY += 50;
    doc.setFont("helvetica", "normal");
    doc.text("( .................................................. )", signLeftX, finalY);
    doc.text("( .................................................. )", signRightX, finalY);

    // Footer page number
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Halaman ${i} dari ${pageCount} — Dicetak otomatis dari Portal Ignatius (${new Date().toLocaleString("id-ID")})`,
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" }
      );
    }

    const safeLingkungan = (lingkunganName || "Semua").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Daftar_KPS_${safeLingkungan}_${Date.now()}.pdf`);
  } catch (err) {
    console.error("Gagal export daftar KPS:", err);
    alert("Gagal mencetak daftar KPS.");
  }
}
