---
tags: [project-overview]
project: portal-ignatius
last-updated: 2026-08-01
---

# Overview: Portal Ignatius (Modul DanSosPar)

## 🧱 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Bahasa:** TypeScript
- **Database & ORM:** Prisma ORM (dengan PostgreSQL/MySQL)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI, Lucide React (Ikon)
- **Data Visualization:** Recharts
- **Dokumen & Laporan:** jsPDF, jspdf-autotable, xlsx (SheetJS)
- **Lainnya:** QRCode (QR Generator), PWA (Service Worker)

## 📁 Struktur Utama
- `src/app/(apps)/dansospar/` - Direktori utama modul Dana Sosial Paroki (berisi Dashboard, KPS, UMKM, SPB, Laporan Keuangan, dsb.)
- `src/app/(apps)/usermanagement/` - Direktori modul manajemen pengguna, matriks akses (RBAC), dan *role*.
- `src/app/(apps)/dataumat/` - Direktori modul Data Umat (masih tahap awal).
- `src/components/` - Komponen React yang bisa digunakan berulang, termasuk komponen bentukan (shadcn/ui), menu profil, *chart*, tombol PDF, dll.
- `src/lib/` - Berisi *utility function* penting seperti `db.ts` (koneksi Prisma), `utils.ts` (termasuk `formatRupiah`), serta logika autentikasi & perizinan (`auth/permissions.ts`).
- `prisma/` - Berisi skema struktur database (`schema.prisma`) dan *script seeder* untuk pengisian data awal.

## ✅ Fitur yang Sudah Ada
- **Dashboard DanSosPar:** Menampilkan metrik dan grafik statistik pencairan dana (perbandingan SPB Reguler vs SPB Rutin) selama 6 bulan terakhir.
- **Master Data (KPS & UMKM):** Manajemen (CRUD) Keluarga Pra-Sejahtera dan UMKM, lengkap dengan sistem pencegahan data ganda, filter area (Lingkungan), serta kotak pencarian.
- **Manajemen SPB (Surat Permohonan Bantuan):** Sistem pengajuan dan *approval* (persetujuan) berjenjang mulai dari PIC (Ketua Lingkungan) → TPDSP → Pastor Paroki.
- **SPB Rutin:** Kemampuan pengelolaan bantuan dana yang bersifat berulang (otomatisasi).
- **Dasbor Persetujuan (Inbox):** Menu khusus untuk *Approver* (Ketua PSE/TPDSP/Pastor) yang hanya menampilkan SPB yang statusnya saat ini wajib mereka setujui sesuai porsi hak akses (*Role-Based Access Control* / RBAC).
- **Cetak Surat Keputusan (SK):** Pembuatan otomatis dokumen persetujuan berupa berkas PDF lengkap dengan logo, tabel anggaran, dan verifikasi validitas melalui QR Code.
- **Laporan Keuangan & Mutasi:** Peninjauan buku kas, pencatatan masuk/keluar, dan fitur ekspor tabel menjadi _file_ PDF maupun Excel.
- **Manajemen Pengguna (User Management):** Pengaturan *Role Matrix*, penambahan akun pengurus, dan fitur reset kata sandi (Ubah Password).

## 🚧 Belum Selesai / Known Issues
- **Autentikasi 2 Langkah (2FA) & Profil Lengkap:** Pengaturan keamanan 2FA secara skema *database* sudah ada, namun belum memiliki antarmuka (UI) untuk *setup* secara mandiri oleh pengguna.
- **Notifikasi *Real-Time*:** Tabel `Notification` sudah dipersiapkan, namun fitur lonceng notifikasi (misal: "SPB anda disetujui") belum terpasang di antarmuka utama aplikasi.
- **Modul Data Umat:** Masih sekadar *folder skeleton* dan belum memiliki fungsionalitas manajemen yang utuh.

## 💭 Catatan Tambahan
- Karena menggunakan optimasi format angka pada Next.js Server & Client, disarankan untuk selalu menggunakan modul utilitas terpadu `formatRupiah` dari `@/lib/utils` untuk mencegah *hydration error*.
- Sistem PWA kadang menimbulkan interupsi kompilasi karena *font fetch* saat *build* jika dijalankan di *environment* berkeamanan tinggi/tanpa akses internet (*sandboxed*). Selalu bangun (*build*) aplikasi di lingkungan dengan konektivitas normal.
