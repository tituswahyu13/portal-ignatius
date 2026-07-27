import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses input Akun User Dummy...");

  const exist = await prisma.user.findUnique({
    where: { email: "admin@portal-ignatius.local" }
  });

  if (!exist) {
    const passwordHash = await bcrypt.hash("password123", 10);
    
    await prisma.user.create({
      data: {
        name: "Admin Paroki",
        email: "admin@portal-ignatius.local",
        passwordHash,
        phoneNumber: "08123456789",
        isActive: true
      }
    });
    console.log(`✅ Berhasil menambahkan User: Admin Paroki`);
  } else {
    console.log(`ℹ️ User sudah ada: Admin Paroki`);
  }

  console.log("🎉 Proses penambahan User selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
