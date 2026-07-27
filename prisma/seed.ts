import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menjalankan seeder database...");

  // 1. Seed Lingkungan
  const lingkunganStYusuf = await prisma.lingkungan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      namaLingkungan: "St. Yusuf",
      wilayah: "Wilayah Tengah",
    },
  });

  const lingkunganStMaria = await prisma.lingkungan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      namaLingkungan: "St. Maria",
      wilayah: "Wilayah Utara",
    },
  });

  console.log("✅ Lingkungan seeded");

  // 2. Seed Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Admin Utama dengan akses penuh ke seluruh sistem",
    },
  });

  const pengurusLingkunganRole = await prisma.role.upsert({
    where: { name: "PENGURUS_LINGKUNGAN" },
    update: {},
    create: {
      name: "PENGURUS_LINGKUNGAN",
      description: "Pengurus lingkungan (Akses terbatas DanSosPar dll)",
    },
  });

  console.log("✅ Roles seeded");

  // 3. Seed Super Admin User (Dummy)
  const adminEmail = "admin@portal-ignatius.id";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin Portal Ignatius",
        email: adminEmail,
        passwordHash: "$2b$10$YourDummyBcryptHashHere", // Hanya placeholder, di sistem nyata dihash saat register
        phoneNumber: "08123456789",
        isActive: true,
        userRoles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });
    console.log(`✅ Admin User created: ${adminUser.email}`);
  } else {
    console.log(`✅ Admin User already exists: ${existingAdmin.email}`);
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
