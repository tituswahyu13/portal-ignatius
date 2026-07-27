---

### 2. File Arsitektur Portal SSO
Nama File: `02_portal_ignatius_architecture.md`

```markdown
# Arsitektur Portal Ignatius & Single Sign-On (SSO)
## Panduan Integrasi Sistem Paroki Terpusat

Dokumen ini mendefinisikan arsitektur untuk **Portal Ignatius**, sebuah *hub* terpusat yang mewadahi berbagai subsistem paroki. Sistem menggunakan arsitektur *Modular Monolith* dengan *Single Sign-On (SSO)* berbasis *HTTP-only cookies*.

---

## 1. Konsep Arsitektur Portal & SSO

1. **Centralized Authentication (SSO)**:
   - Sesi di-manage di level *root* (portal) melalui Supabase/NextAuth.
   - Setelah login, JWT token disimpan pada *HTTP-only cookie* yang valid melintasi semua route (app modules).
2. **Role-Based App Visibility**:
   - Tampilan Grid Portal bersifat dinamis. *Admin Lingkungan* hanya melihat "Dana Sosial Paroki", sedangkan *Pastor Paroki* melihat modul "Manajemen User", "Sistem Data Umat", dll.
3. **Global User Management**:
   - Modul Manajemen User, Role, dan Hak Akses dipisahkan menjadi **Core App** di dalam Portal.

---

## 2. Struktur Folder (Next.js 14 App Router)

Gunakan **Route Groups** `(...)` untuk memisahkan layout portal utama dengan layout aplikasi:

```text
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Route Group: Autentikasi
│   │   │   └── login/page.tsx         
│   │   │
│   │   ├── (portal)/                  # Route Group: Portal Hub Utama
│   │   │   ├── layout.tsx             # Navbar Global, User Profile Menu
│   │   │   └── page.tsx               # Grid Daftar Aplikasi (App Launcher)
│   │   │
│   │   ├── (apps)/                    # Route Group: Berbagai Aplikasi
│   │   │   ├── layout.tsx             # Layout Modular (Sidebar dinamis per app)
│   │   │   ├── usermanagement/        # Modul Manajemen User & Akses (Global)
│   │   │   ├── dansospar/             # Modul Dana Sosial Paroki 
│   │   │   ├── dataumat/              # [PLACEHOLDER] Sistem Data Umat ("Coming Soon")
│   │   │   └── keuangan/              # [PLACEHOLDER] Keuangan Paroki ("Coming Soon")
│   │   │
│   │   └── api/                       # Global API Routes