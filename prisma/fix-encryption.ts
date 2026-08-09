// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import crypto from "crypto";

const prisma = new PrismaClient();

// Fungsi enkripsi yang sama dari src/lib/encryption.ts
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

function encryptString(text: string): string {
  if (!text) return "";
  
  const keyStr = process.env.DATA_ENCRYPTION_KEY;
  if (!keyStr || keyStr.length !== 64) {
    throw new Error("DATA_ENCRYPTION_KEY belum disetel atau panjangnya bukan 64 karakter.");
  }
  const key = Buffer.from(keyStr, "hex");
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(String(text), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}

async function main() {
  console.log("Memulai perbaikan enkripsi No. KK...");
  
  const umatData = await prisma.dataUmat.findMany({
    where: { kkEncrypted: { not: null } }
  });

  let fixedCount = 0;

  for (const umat of umatData) {
    // String terenkripsi dari aes-256-gcm kita pasti sangat panjang (salt + iv + tag + data) > 100 karakter
    // Jika kurang dari 50, berarti itu adalah No. KK mentah dari CSV (teks biasa 16 digit)
    if (umat.kkEncrypted && umat.kkEncrypted.length < 50) {
      const properEncrypted = encryptString(umat.kkEncrypted);
      
      await prisma.dataUmat.update({
        where: { id: umat.id },
        data: { kkEncrypted: properEncrypted }
      });
      
      fixedCount++;
    }
  }

  console.log(`Selesai! Berhasil memperbaiki enkripsi untuk ${fixedCount} No. KK yang tadinya masih teks biasa.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
