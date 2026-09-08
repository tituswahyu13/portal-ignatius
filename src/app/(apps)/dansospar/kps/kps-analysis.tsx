import { Info, AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KpsAnalysisProps {
  kps: any;
}

export function KpsAnalysis({ kps }: KpsAnalysisProps) {
  const recommendations: { title: string; message: string; type: "critical" | "warning" | "info" | "success" }[] = [];

  let age: number | null = null;
  if (kps.umat?.tanggalLahir) {
    const birthDate = new Date(kps.umat.tanggalLahir);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  // Analisa Pekerjaan & Usia
  if (kps.skorPekerjaan === 1) {
    if (age !== null && age >= 60) {
      recommendations.push({
        title: "Lansia Tanpa Penghasilan",
        message: `Kepala keluarga berusia lansia (${age} tahun) dan tidak berpenghasilan. Sangat rentan. Prioritaskan bantuan rutin (sembako/kesehatan) alih-alih paksaan untuk bekerja.`,
        type: "critical"
      });
    } else {
      recommendations.push({
        title: "Pengangguran / Pekerjaan Sangat Rentan",
        message: `Tidak bekerja atau berpenghasilan sangat tidak menentu. Diperlukan intervensi bantuan modal UMKM atau pelatihan keterampilan segera.`,
        type: "critical"
      });
    }
  } else if (kps.skorPekerjaan === 2) {
    if (age !== null && age >= 60) {
      recommendations.push({
        title: "Lansia Bekerja Serabutan",
        message: `Lansia (${age} tahun) masih bekerja dengan penghasilan menengah/pas-pasan. Perlu dipantau kondisi fisiknya.`,
        type: "warning"
      });
    } else {
      recommendations.push({
        title: "Pekerjaan Kurang Stabil",
        message: `Pekerjaan berpenghasilan pas-pasan. Pertimbangkan program pemberdayaan ekonomi atau bimbingan usaha.`,
        type: "warning"
      });
    }
  } else if (kps.skorPekerjaan === 3 && age !== null && age >= 60) {
    recommendations.push({
      title: "Lansia Produktif",
      message: `Kepala keluarga berusia lansia (${age} tahun) namun masih bekerja dan mandiri secara ekonomi.`,
      type: "info"
    });
  }

  // Analisa Pangan
  if (kps.skorPangan === 1) {
    recommendations.push({
      title: "Risiko Pangan (Kritis)",
      message: "Kualitas/kuantitas makan harian sangat terbatas. Prioritaskan bantuan Sembako rutin/darurat.",
      type: "critical"
    });
  } else if (kps.skorPangan === 2) {
    recommendations.push({
      title: "Risiko Pangan (Sedang)",
      message: "Pemenuhan gizi dasar pas-pasan. Layak dipertimbangkan untuk subsidi sembako bulanan.",
      type: "warning"
    });
  }

  // Analisa Papan (Rumah)
  if (kps.skorPapan === 1) {
    recommendations.push({
      title: "Kondisi Rumah Tidak Layak / Numpang",
      message: "Status rumah sangat tidak layak/rawan. Prioritaskan program bedah rumah atau bantuan SPB Papan.",
      type: "critical"
    });
  } else if (kps.skorPapan === 2) {
    recommendations.push({
      title: "Kondisi Rumah Kurang Memadai",
      message: "Rumah sederhana/mengontrak. Perlu dibantu jika ada tunggakan sewa.",
      type: "warning"
    });
  }

  // Analisa Kesehatan
  if (kps.skorKesehatan === 1) {
    recommendations.push({
      title: "Darurat Kesehatan",
      message: "Terdapat anggota keluarga dengan penyakit kronis berat/disabilitas parah. Prioritaskan SPB Kesehatan atau BPJS.",
      type: "critical"
    });
  } else if (kps.skorKesehatan === 2) {
    recommendations.push({
      title: "Kesehatan Terpantau",
      message: "Memiliki BPJS aktif dan kondisi umum sehat. Pantau jika ada kendala dalam pembayaran iuran BPJS mandiri.",
      type: "info"
    });
  }

  // Analisa Pendidikan
  if (kps.skorPendidikan === 1) {
    recommendations.push({
      title: "Krisis Pendidikan",
      message: "Anak terancam putus sekolah karena biaya. Wajib diprioritaskan untuk Beasiswa atau SPB Pendidikan.",
      type: "critical"
    });
  } else if (kps.skorPendidikan === 2) {
    recommendations.push({
      title: "Kendala Pendidikan",
      message: "Mampu sekolah tapi kesulitan membeli buku/seragam/SPP bulanan. Layak dibantu SPB Pendidikan.",
      type: "warning"
    });
  }

  if (kps.skorSosial === 1) {
    recommendations.push({
      title: "Kendala Pembayaran Iuran",
      message: "Tidak pernah mampu membayar iuran lingkungan karena faktor ekonomi. Dapat dipertimbangkan untuk pembebasan iuran lingkungan/paroki.",
      type: "warning"
    });
  }
  if (kps.skorSandang === 1) {
    recommendations.push({
      title: "Kekurangan Sandang",
      message: "Kekurangan pakaian layak pakai. Berikan bantuan pakaian pantas pakai.",
      type: "info"
    });
  }

  // Jika tidak ada kondisi kritis (Semua >= 3)
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Kondisi Stabil",
      message: "Berdasarkan evaluasi, keluarga ini dalam kondisi relatif stabil dan sejahtera.",
      type: "success"
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Info className="h-4 w-4" />
        Analisa & Rekomendasi Kelayakan
      </h4>
      <div className="grid gap-3">
        {recommendations.map((rec, index) => (
          <div 
            key={index} 
            className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${
              rec.type === "critical" ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive" :
              rec.type === "warning" ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 [&>svg]:text-yellow-600" :
              rec.type === "info" ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-500 [&>svg]:text-blue-600" :
              rec.type === "success" ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-500 [&>svg]:text-green-600" : ""
            }`}
          >
            {rec.type === "critical" && <AlertTriangle className="h-4 w-4" />}
            {rec.type === "warning" && <AlertTriangle className="h-4 w-4" />}
            {rec.type === "info" && <Info className="h-4 w-4" />}
            {rec.type === "success" && <ShieldCheck className="h-4 w-4" />}
            
            <h5 className="mb-1 text-sm font-bold flex items-center gap-2 leading-none tracking-tight">
              {rec.title}
              {rec.type === "critical" && <Badge variant="destructive" className="h-5 px-1 text-[10px]">Prioritas</Badge>}
            </h5>
            <div className="text-xs [&_p]:leading-relaxed">
              {rec.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
