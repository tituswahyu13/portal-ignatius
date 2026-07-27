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

  const rolesToCreate = [
    { name: "PENGURUS_LINGKUNGAN", desc: "Pengurus lingkungan umum" },
    { name: "PSE Wilayah/Lingkungan", desc: "Pengurus PSE di tingkat Wilayah atau Lingkungan" },
    { name: "Ketua Dansospar", desc: "Ketua Dana Sosial Paroki" },
    { name: "Sekretaris Dansospar", desc: "Sekretaris Dana Sosial Paroki" },
    { name: "Bendahara Dansospar", desc: "Bendahara Dana Sosial Paroki" },
    { name: "Pastor", desc: "Pastor Paroki penyetuju dokumen" }
  ];

  for (const r of rolesToCreate) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: {
        name: r.name,
        description: r.desc,
      },
    });
  }

  console.log("✅ Roles seeded");

  // --- SEED PERMISSIONS ---
  const permissionsToCreate = [
    { name: "MANAGE_USERS", appModule: "GLOBAL", desc: "Kelola pengguna, role, dan hak akses" },
    { name: "VIEW_DANSOSPAR_DASHBOARD", appModule: "DANSOSPAR", desc: "Lihat dashboard DanSosPar" },
    { name: "CREATE_SPB", appModule: "DANSOSPAR", desc: "Buat pengajuan SPB baru" },
    { name: "REVIEW_SPB_PIC", appModule: "DANSOSPAR", desc: "Review SPB sebagai PIC (Ketua Lingkungan/Wilayah)" },
    { name: "APPROVE_SPB_TPDSP", appModule: "DANSOSPAR", desc: "Setujui SPB sebagai Tim Pelayanan DanSosPar" },
    { name: "APPROVE_SPB_PASTOR", appModule: "DANSOSPAR", desc: "Setujui SPB sebagai Pastor" },
    { name: "REALIZE_SPB", appModule: "DANSOSPAR", desc: "Cairkan dana SPB (Bendahara)" },
    { name: "MANAGE_KPS", appModule: "DANSOSPAR", desc: "Kelola data KPS (Keluarga Pra-Sejahtera)" },
    { name: "MANAGE_UMKM", appModule: "DANSOSPAR", desc: "Kelola data UMKM" }
  ];

  for (const p of permissionsToCreate) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        appModule: p.appModule,
        description: p.desc
      }
    });
  }
  
  // Berikan semua akses ke SUPER_ADMIN
  const allPerms = await prisma.permission.findMany();
  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: p.id }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id
      }
    });
  }

  console.log("✅ Permissions seeded");

  // --- SEED SUPER ADMIN USER ---(Dummy)
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
