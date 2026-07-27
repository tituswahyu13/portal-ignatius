---

### 4. File Panduan Keamanan (Security)
Nama File: `04_security_guidelines.md`

```markdown
# Security & Data Protection Guidelines
## Pengelolaan Dana Sosial Paroki St. Ignatius Magelang

Dokumen ini mendefinisikan arsitektur keamanan, perlindungan data pribadi (PII), dan mitigasi risiko OWASP.

---

## 1. Otentikasi & Sesi Pengguna

1. **Multi-Factor Authentication (MFA / 2FA)**:
   - Wajib diaktifkan (via TOTP/Authenticator) untuk akun **Bendahara II DPP** dan **Pastor Paroki**.
2. **Sesi & Rate Limiting**:
   - Otomatis *logout* jika sistem tidak aktif (idle) selama 30 menit.
   - Login terkunci 15 menit jika terjadi 5x kegagalan berturut-turut.

---

## 2. Proteksi Data Pribadi (PII)

Field sensitif (contoh: NIK, catatan medis) wajib menggunakan **Encryption at Rest (AES-256-GCM)**. 
- *Data Masking*: NIK wajib disamarkan pada tampilan tabel (cth: `330801**********0002`). Tombol "Lihat Data Utuh" akan mencatat aksi ke `audit_logs`.

---

## 3. Google Drive Secure Upload Pipeline

Penyimpanan file lampiran (RAB, Foto, NIB, dll) dialihkan ke **Google Drive API** secara *proxy* melalui server Next.js:

1. **Magic Bytes Verification**: File diverifikasi berdasarkan *header file asli*, bukan hanya dari ekstensi.
2. **Sanitasi File**: Nama asli diubah menjadi **UUID v4**.
3. **Storage Isolation**: File diunggah menggunakan **Google Service Account**. Folder tujuan di Drive **TIDAK** di-share ke publik. Database hanya menyimpan `google_drive_file_id`.
4. **Proxy Download Stream**: Klien tidak pernah mendapatkan URL Google Drive. File diambil (*piping stream*) melalui *endpoint* internal Next.js setelah sesi pengguna diverifikasi (*RBAC Enforced*).

---

## 4. Validasi Dokumen (Anti-Forgery)

Untuk mencegah pemalsuan Surat Keputusan (SK) Persetujuan fisik:
- Sistem menyisipkan **QR Code** berisi *Cryptographic Hash (SHA-256)* pada file PDF. 
- Saat di-scan, QR Code mengarahkan ke halaman verifikasi publik internal portal (`/verify-sk?hash=...`) yang menampilkan status keaslian langsung dari database.