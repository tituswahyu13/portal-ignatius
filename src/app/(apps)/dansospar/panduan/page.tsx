import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Book, 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText, 
  Wallet, 
  PieChart, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Panduan Aplikasi - Portal Ignatius",
  description: "Panduan penggunaan modul Dana Sosial Paroki",
};

export default function PanduanPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            Panduan Aplikasi DanSosPar
          </h2>
          <p className="text-muted-foreground mt-1">
            Pelajari cara menggunakan berbagai fitur dan modul yang ada di dalam sistem Dana Sosial Paroki (DanSosPar).
          </p>
        </div>
      </div>

      <Tabs defaultValue="kps" className="space-y-4 mt-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-muted/50 gap-1">
          <TabsTrigger value="dashboard" className="py-2"><LayoutDashboard className="h-4 w-4 mr-2 hidden md:inline" /> Dashboard</TabsTrigger>
          <TabsTrigger value="kps" className="py-2"><Users className="h-4 w-4 mr-2 hidden md:inline" /> KPS</TabsTrigger>
          <TabsTrigger value="umkm" className="py-2"><Store className="h-4 w-4 mr-2 hidden md:inline" /> UMKM</TabsTrigger>
          <TabsTrigger value="spb" className="py-2"><FileText className="h-4 w-4 mr-2 hidden md:inline" /> SPB</TabsTrigger>
          <TabsTrigger value="kas" className="py-2"><Wallet className="h-4 w-4 mr-2 hidden md:inline" /> Kas</TabsTrigger>
          <TabsTrigger value="laporan" className="py-2"><PieChart className="h-4 w-4 mr-2 hidden md:inline" /> Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="kps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Master Data KPS (Keluarga Pra-Sejahtera)
              </CardTitle>
              <CardDescription>
                Modul ini digunakan untuk mendata, mengevaluasi, dan memonitor warga yang berstatus Pra-Sejahtera di tiap lingkungan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Alur Pendaftaran & Evaluasi KPS</h3>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>Data umat ditarik secara otomatis dari <strong>Master Data Umat</strong>.</li>
                  <li>Pengurus memilih umat yang ingin didaftarkan sebagai KPS.</li>
                  <li>Pengurus menilai keluarga berdasarkan 7 (tujuh) Aspek/Indikator Kelayakan (Pekerjaan, Pangan, Papan, Kesehatan, Pendidikan, Sosial, Sandang).</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Sistem Penilaian (Scoring) 0 - 3</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Tiap indikator dinilai secara terukur menggunakan skala 0 hingga 3. Cara membacanya adalah sebagai berikut:
                </p>
                <ul className="list-none space-y-3">
                  <li className="flex gap-3 items-start border p-3 rounded-md bg-background">
                    <Badge variant="destructive" className="mt-0.5 whitespace-nowrap">Skor 1 (Rentan)</Badge>
                    <p className="text-sm text-muted-foreground">Menandakan kondisi sangat memprihatinkan atau kritis. Keluarga tidak mampu memenuhi kebutuhan dasar pada aspek tersebut. Membutuhkan intervensi/bantuan segera.</p>
                  </li>
                  <li className="flex gap-3 items-start border p-3 rounded-md bg-background">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-500 mt-0.5 whitespace-nowrap">Skor 2 (Menengah)</Badge>
                    <p className="text-sm text-muted-foreground">Menandakan kondisi pas-pasan. Keluarga mampu bertahan secara swadaya namun rentan terhadap guncangan (misal jika ada yang sakit atau di-PHK). Layak mendapat subsidi/bantuan parsial.</p>
                  </li>
                  <li className="flex gap-3 items-start border p-3 rounded-md bg-background">
                    <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-500 mt-0.5 whitespace-nowrap">Skor 3 (Mandiri)</Badge>
                    <p className="text-sm text-muted-foreground">Menandakan kondisi stabil dan mandiri. Keluarga tidak membutuhkan bantuan material untuk aspek ini.</p>
                  </li>
                  <li className="flex gap-3 items-start border p-3 rounded-md bg-muted/50">
                    <Badge variant="secondary" className="mt-0.5 whitespace-nowrap">Skor 0 (N/A)</Badge>
                    <p className="text-sm text-muted-foreground">Artinya <strong>Tidak Relevan</strong> (Not Applicable). Contoh: Indikator Pendidikan tidak relevan bagi keluarga yang tidak memiliki anak usia sekolah. Skor 0 tidak akan dianggap sebagai kondisi kritis.</p>
                  </li>
                </ul>
                
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <h4 className="font-semibold text-sm mb-2">Rumus Penghitungan Persentase Kelayakan</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sistem menggunakan metode pembobotan (<strong>Weighted Score</strong>) untuk menghitung tingkat kerentanan. 
                    Masing-masing indikator memiliki bobot prioritas yang berbeda, dengan total 100%:
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs font-medium">
                    <div className="bg-background border p-2 rounded">💼 Pekerjaan: 25%</div>
                    <div className="bg-background border p-2 rounded">🍚 Pangan: 20%</div>
                    <div className="bg-background border p-2 rounded">🏠 Papan: 15%</div>
                    <div className="bg-background border p-2 rounded">⚕️ Kesehatan: 15%</div>
                    <div className="bg-background border p-2 rounded">📚 Pendidikan: 10%</div>
                    <div className="bg-background border p-2 rounded">👕 Sandang: 10%</div>
                    <div className="bg-background border p-2 rounded">👥 Sosial: 5%</div>
                  </div>

                  <div className="bg-background border p-3 rounded-md font-mono text-xs overflow-x-auto mb-3">
                    <span className="text-muted-foreground">Rumus:</span><br/>
                    (Skor Input / 3) × Bobot Indikator = Poin Weighted<br/>
                    <br/>
                    <span className="text-muted-foreground">Contoh jika Pekerjaan dapat skor 1:</span><br/>
                    (1 / 3) × 25% = 8.33% dari maksimal 25%
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Sistem hanya akan menghitung bobot yang aktif (skor 1-3). Jika ada indikator berskor <strong>0 (N/A)</strong>, pembaginya akan disesuaikan secara dinamis agar persentasenya tetap akurat. 
                    Jika total akhirnya <strong>&lt; 66%</strong>, maka keluarga ditetapkan berstatus <strong>Prasejahtera</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Hasil Analisis Cerdas (Rule-Based)</h3>
                <p className="text-sm text-muted-foreground">
                  Alih-alih hanya melihat angka total, sistem membaca kombinasi skor yang Anda inputkan dan memberikan rekomendasi yang spesifik:
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="border border-red-500/50 bg-red-500/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-500 mb-1">
                      <AlertTriangle className="h-4 w-4" /> Deteksi Kondisi Kritis & Peringatan
                    </div>
                    <p className="text-xs text-muted-foreground">Sistem akan memunculkan <em>alert merah (Kritis)</em> untuk indikator utama berskor <strong>1 (Rentan)</strong> (misal: &quot;Risiko Pangan Kritis&quot;), atau <em>alert kuning (Peringatan)</em> untuk indikator sekunder seperti kendala iuran agar Pengurus langsung tahu kelemahan keluarga tersebut.</p>
                  </div>
                  <div className="border border-yellow-500/50 bg-yellow-500/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 font-bold text-yellow-600 dark:text-yellow-500 mb-1">
                      <AlertTriangle className="h-4 w-4" /> Deteksi Kondisi Menengah & Terpantau
                    </div>
                    <p className="text-xs text-muted-foreground">Untuk indikator berskor <strong>2 (Menengah)</strong>, sistem umumnya memunculkan <em>alert kuning</em> sebagai langkah preventif, atau <em>alert biru (Info)</em> bila kondisi relatif stabil namun tetap perlu dipantau (misal: kesehatan dengan BPJS kelas 3).</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border-primary/20 border p-4 rounded-lg space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-primary">
                  <Badge variant="default" className="bg-primary">Kecerdasan Sistem</Badge> 
                  Korelasi Usia & Pekerjaan
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Selain melihat skor secara mandiri, sistem mampu menghubungkan data secara bersilang (<em>Cross-Validation</em>). 
                  Sistem mengecek <strong>Usia Kepala Keluarga</strong> dari Master Data Umat dan membandingkannya dengan <strong>Skor Pekerjaan</strong>. 
                  Jika warga berstatus Lansia (&ge; 60 tahun) dan skor pekerjaannya Rentan (Skor 1), maka sistem akan tegas menyarankan pemberian <strong>Bantuan Sembako/Kesehatan Rutin</strong> (tidak menyarankan bantuan modal usaha karena usia). Sebaliknya, untuk warga Usia Produktif (&lt; 60 tahun), sistem akan mendorong pemberian <strong>Modal UMKM</strong> agar bisa mandiri.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Dashboard Utama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Dashboard memberikan ringkasan (summary) atas semua aktivitas di DanSosPar, termasuk:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Total saldo kas yang saat ini tersedia.</li>
                <li>Jumlah keluarga Pra-Sejahtera yang tercatat aktif.</li>
                <li>Status pengajuan SPB yang sedang menunggu persetujuan Anda.</li>
                <li>Grafik aliran dana masuk dan keluar per bulan.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="umkm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Data UMKM & Lapak Mandiri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Digunakan untuk mendata usaha kecil (UMKM) milik umat, baik yang dibantu melalui modal DanSosPar maupun usaha mandiri umat.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Status Binaan vs Mandiri:</strong> Binaan berarti mendapat bantuan modal dari DanSosPar, sedangkan Mandiri berarti pendataan untuk pemberdayaan komunitas.</li>
                <li>Data UMKM dapat dikaitkan langsung dengan warga berstatus KPS.</li>
                <li>Lokasi lapak dan jenis usaha dicatat untuk mempermudah monitoring perkembangan ekonomi umat.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spb" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Manajemen SPB (Sumbangan Pembangunan / Bantuan)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Sistem pengajuan bantuan menggunakan alur persetujuan bertingkat untuk menjamin transparansi pencairan dana kas.
                </p>
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold text-foreground">1. Pengajuan SPB Insidental</h4>
                  <p className="text-sm">Diajukan oleh Pengurus Lingkungan untuk kebutuhan mendesak (Kematian, Sakit, Bencana). Wajib menyertakan bukti lampiran (foto/dokumen).</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">2. SPB Rutin</h4>
                  <p className="text-sm">Digunakan khusus untuk warga KPS berstatus Lansia/Kronis yang menerima bantuan pangan atau kesehatan per bulan secara konstan.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">3. Alur Persetujuan (Approval)</h4>
                  <p className="text-sm">Pengajuan $\rightarrow$ Verifikasi Tim DanSosPar $\rightarrow$ Persetujuan Romo Kepala $\rightarrow$ Pencairan oleh Bendahara.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Kas & Intensi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pencatatan langsung atas uang yang masuk (kolekte, donasi khusus, intensi misa) maupun mutasi pengeluaran kas.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Sistem menolak pencairan SPB jika saldo kas tidak mencukupi (Insufficient Funds).</li>
                <li>Setiap SPB yang disetujui (Disetujui Romo) akan otomatis membuat catatan <strong>Kas Keluar</strong> tanpa perlu diinput ulang oleh bendahara.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Laporan Keuangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Fitur rekapitulasi untuk transparansi laporan kepada umat atau Keuskupan.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Penyaringan laporan berdasarkan rentang tanggal (Bulan/Tahun).</li>
                <li>Tersedia fungsi <em>Export to Excel/PDF</em> untuk diumumkan pada lembar warta paroki.</li>
                <li>Menampilkan proporsi pengeluaran berdasarkan tipe (Pendidikan, Kesehatan, Sembako, Modal Usaha).</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
