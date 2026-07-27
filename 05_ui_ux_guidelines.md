# UI/UX & Design System Guidelines
## Web Application Pengelolaan Dana Sosial Paroki St. Ignatius Magelang

---

## 1. Asas & Desain Utama

1. **Inklusif & Jelas**: Menggunakan bahasa parokial (SPB, KPS, KLMTD, Realisasi) yang mudah dipahami oleh pengurus lintas usia.
2. **Dual-Mode Responsiveness**:
   - *Mobile-First*: Untuk Admin Lingkungan (entri data KPS, upload foto via smartphone).
   - *Desktop-Optimized*: Untuk TPDSP (rapat verifikasi, tabel rekapitulasi, dashboard kas).

---

## 2. Design System (Tailwind CSS & shadcn/ui)

- **Primary (Sovereign Navy)**: `hsl(222, 47%, 11%)` - Header, Tombol Utama.
- **Secondary (Warm Gold)**: `hsl(38, 92%, 50%)` - Badge Status, Highlight.
- **Success (Emerald)**: `hsl(142, 71%, 45%)` - Status Disetujui/Dicairkan.
- **Warning (Amber)**: `hsl(38, 92%, 50%)` - Menunggu Verifikasi, Peringatan Pagu.
- **Destructive (Crimson Red)**: `hsl(0, 84%, 60%)` - Ditolak, Hapus Data.
- **Background (Soft Pearl)**: `hsl(210, 40%, 98%)` - Base Layout.

---

## 3. UI Patterns & Alur Antarmuka

1. **Form Wizard (Stepper) untuk SPB**:
   Pengajuan SPB dibagi menjadi tahapan logis: 
   `[1. Subjek/Kategori]` -> `[2. Rincian Biaya]` -> `[3. Upload Lampiran]` -> `[Submit]`.
2. **Visual Status Tracker**:
   Tampilan *timeline* horizontal pada detail SPB untuk melihat perjalanan dokumen (`Diajukan -> Verifikasi PIC -> Disetujui -> Dicairkan`).
3. **Empty States & Skeletons**:
   Tampilkan visual memuat (*loading skeleton*) pada koneksi lambat dan ilustrasi *Empty State* yang ramah jika belum ada data.