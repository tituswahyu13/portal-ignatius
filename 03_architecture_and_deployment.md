---

### 3. File Arsitektur, Deployment & Setup Environment
Nama File: `03_architecture_and_deployment.md`

```markdown
# Architecture, Deployment & Testing Guidelines
## Web Application Pengelolaan Dana Sosial Paroki St. Ignatius Magelang

Dokumen ini memandu struktur pengembangan, manajemen variabel *environment*, dan skenario *deployment*. 

---

## 1. Manajemen Environment Variables (`.env.example`)

Gunakan `.env.example` berikut sebagai acuan untuk mengatur Zod / T3 Env Validation:

```env
# ENVIRONMENT
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# DATABASE (Supabase / PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# AUTHENTICATION (Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"

# GOOGLE DRIVE API (STORAGE BACKEND)
GOOGLE_CLIENT_EMAIL="[YOUR_SERVICE_ACCOUNT_EMAIL]"
GOOGLE_PRIVATE_KEY="[YOUR_SERVICE_ACCOUNT_PRIVATE_KEY_IN_BASE64]"
GOOGLE_DRIVE_FOLDER_ID="[THE_ID_OF_THE_FOLDER_TO_STORE_FILES]"

# ENCRYPTION KEYS (PII Data - AES-256-GCM)
DATA_ENCRYPTION_KEY="[GENERATE_A_32_BYTE_HEX_STRING_HERE]"