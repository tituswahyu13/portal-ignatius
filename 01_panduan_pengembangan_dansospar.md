# Panduan Pengembangan & Spesifikasi Sistem Web Application
## Pengelolaan Dana Sosial Paroki St. Ignatius Magelang

Dokumen ini merupakan panduan teknis dan spesifikasi arsitektur komprehensif untuk membangun aplikasi web Dana Sosial Paroki berbasis Petunjuk Teknis 2026.

---

## 1. Ikhtisar Sistem & Kebutuhan Bisnis

Aplikasi ini bertujuan untuk mentransformasi tata kelola Dana Sosial Paroki dari proses manual menjadi sistem digital terpadu, transparan, dan akuntabel.

### Ringkasan Aturan Bisnis Utama:
1. **7 Sub-Account Intensi Dana**:
   - Dana Papa Miskin (15% dari Kolekte Umum + Persembahan Bulanan)
   - Dana APP Paroki (25% dari Kotak APP + Minggu Palma)
   - Dana Bantuan Pendidikan
   - Dana Bantuan Kesehatan
   - Dana Bantuan Pangruktilaya
   - Dana Bantuan Seminari
   - Dana Bantuan Bencana
2. **Prioritas Subjek**:
   - Data Keluarga Pra Sejahtera (KPS) - 5 Kebutuhan Pokok.
   - Usaha Mikro Kecil dan Menengah (UMKM Mikro) - Aset <= Rp 20jt, Omset <= Rp 100jt/thn.
3. **Batas Frekuensi & Rule Engine**:
   - Pangan: Maks 2x/tahun.
   - Papan (Bedah Rumah): 1x seumur hidup (Pagu maks Rp 3.000.000).
   - Pendidikan & Kesehatan: Maks 1-2x/tahun.
   - UMKM: 1x seumur hidup (Pagu maks Rp 2.000.000, khusus peralatan usaha).
4. **Siklus Batas Waktu (Cut-Off)**:
   - Pengajuan SPB dari Lingkungan: Maksimal Tanggal 15 tiap bulan.
   - Rapat Verifikasi TPDSP: Selasa Minggu ke-4 pkl 18.00 WIB.
   - Pengesahan Pastor Paroki: H+1 setelah rapat.
   - Realisasi Pencairan: Maksimal H+7.

---

## 2. Skema Basis Data (Database Schema - SQL DDL)

Skema ini telah disesuaikan untuk mendukung Arsitektur Portal (App-Aware RBAC) dan Google Drive Storage.

```sql
-- 1. MASTER WILAYAH & LINGKUNGAN
CREATE TABLE lingkungan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lingkungan VARCHAR(100) NOT NULL,
    wilayah VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & RBAC (APP-AWARE)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_module VARCHAR(50) NOT NULL, -- e.g., 'GLOBAL', 'DANSOSPAR', 'DATAUMAT'
    name VARCHAR(100) UNIQUE NOT NULL, 
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    lingkungan_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lingkungan_id) REFERENCES lingkungan(id)
);

CREATE TABLE user_roles (
    user_id BIGINT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 3. DATA SUBJEK (KPS & UMKM)
CREATE TABLE kps_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lingkungan_id INT NOT NULL,
    nama_kepala_keluarga VARCHAR(150) NOT NULL,
    nik_encrypted VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    pangan_layak BOOLEAN DEFAULT TRUE,
    sandang_layak BOOLEAN DEFAULT TRUE,
    papan_layak BOOLEAN DEFAULT TRUE,
    kesehatan_layak BOOLEAN DEFAULT TRUE,
    pendidikan_layak BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lingkungan_id) REFERENCES lingkungan(id)
);

CREATE TABLE umkm_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lingkungan_id INT NOT NULL,
    nama_pemilik VARCHAR(150) NOT NULL,
    nama_usaha VARCHAR(150) NOT NULL,
    jenis_usaha VARCHAR(100),
    aset_total DECIMAL(15,2),
    omset_tahunan DECIMAL(15,2),
    nib VARCHAR(50),
    status_kelayakan BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lingkungan_id) REFERENCES lingkungan(id)
);

-- 4. KEUANGAN & INTENSI
CREATE TABLE intensi_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_account VARCHAR(20) UNIQUE NOT NULL,
    nama_intensi VARCHAR(100) NOT NULL,
    saldo DECIMAL(15,2) DEFAULT 0.00
);

CREATE TABLE financial_mutations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    intensi_id INT NOT NULL,
    type ENUM('IN', 'OUT') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    source_type ENUM('KOLEKTE', 'PERSEMBAHAN_BULANAN', 'APP', 'DONASI', 'SPB_REALIZATION', 'INTER_TRANSFER') NOT NULL,
    reference_id VARCHAR(100),
    description TEXT,
    created_by BIGINT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intensi_id) REFERENCES intensi_accounts(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 5. SURAT PERMOHONAN BANTUAN (SPB) & APPROVAL
CREATE TABLE spb_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nomor_spb VARCHAR(100) UNIQUE NOT NULL,
    lingkungan_id INT NOT NULL,
    kps_id BIGINT NULL,
    umkm_id BIGINT NULL,
    intensi_id INT NOT NULL,
    kategori_bantuan VARCHAR(50) NOT NULL,
    total_biaya DECIMAL(15,2) NOT NULL,
    dana_swadaya DECIMAL(15,2) DEFAULT 0,
    dana_lingkungan DECIMAL(15,2) DEFAULT 0,
    dana_paroki_requested DECIMAL(15,2) NOT NULL,
    dana_kevikepan_requested DECIMAL(15,2) DEFAULT 0,
    status ENUM('SUBMITTED', 'REVIEW_PIC', 'APPROVED_TPDSP', 'REJECTED', 'APPROVED_PASTOR', 'REALIZED') DEFAULT 'SUBMITTED',
    rejection_reason TEXT NULL,
    created_by BIGINT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lingkungan_id) REFERENCES lingkungan(id),
    FOREIGN KEY (kps_id) REFERENCES kps_data(id),
    FOREIGN KEY (umkm_id) REFERENCES umkm_data(id),
    FOREIGN KEY (intensi_id) REFERENCES intensi_accounts(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Note: Menggunakan google_drive_file_id untuk storage
CREATE TABLE spb_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    spb_id BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    google_drive_file_id VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spb_id) REFERENCES spb_requests(id) ON DELETE CASCADE
);

CREATE TABLE sk_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nomor_sk VARCHAR(100) UNIQUE NOT NULL,
    spb_id BIGINT NOT NULL,
    total_approved_paroki DECIMAL(15,2) NOT NULL,
    total_approved_kevikepan DECIMAL(15,2) DEFAULT 0,
    qr_hash VARCHAR(255) NOT NULL,
    pdf_google_drive_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spb_id) REFERENCES spb_requests(id)
);