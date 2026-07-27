import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Memuat .env manual untuk script one-off
const envPath = path.resolve(process.cwd(), ".env");
const envFile = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)="?(.*)"?$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
});

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Gagal membaca kredensial Supabase dari .env");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  const email = "admin@portal-ignatius.id";
  const password = "AdminPassword123!";

  console.log("Mencoba membuat akun admin di Supabase Auth...");
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already exists")) {
      console.log("✅ Akun admin sudah terdaftar di Supabase Auth.");
    } else {
      console.error("❌ Error Supabase Auth:", error);
    }
  } else {
    console.log(`✅ Sukses! Akun dibuat: ${data.user.email}`);
    console.log(`🔑 Gunakan password ini untuk login: ${password}`);
  }
}

createAdmin();
