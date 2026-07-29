import { db as prisma } from "./src/lib/db";
import { encryptString } from "./src/lib/encryption";

async function runSeeder() {
  console.log("Menjalankan Seeder Data Dummy...");

  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
    console.log("❌ Tidak ada user, harap jalankan prisma db seed terlebih dahulu.");
    return;
  }

  const lingkungan = await prisma.lingkungan.findFirst();
  if (!lingkungan) {
    console.log("❌ Tidak ada lingkungan, harap jalankan prisma db seed terlebih dahulu.");
    return;
  }

  const userId = adminUser.id;
  const lingkunganId = lingkungan.id;

  // 1. Kas Intensi
  const intensi = await prisma.intensiAccount.upsert({
    where: { kodeAccount: "KAS-APP" },
    update: {},
    create: {
      kodeAccount: "KAS-APP",
      namaIntensi: "Dana APP",
      saldo: 50000000,
    }
  });
  console.log("✅ Intensi Dummy Seeded");

  // 2. KPS Data
  const nikEnc = encryptString("3301111111111111");
  const kkEnc = encryptString("3301112222222222");
  
  const kps = await prisma.kpsData.create({
    data: {
      namaKepalaKeluarga: "Bapak Budi (Dummy)",
      nikEncrypted: nikEnc,
      kkEncrypted: kkEnc,
      alamat: "Jl. Mangga No. 123",
      lingkunganId: lingkunganId,
      createdBy: userId,
      statusKeluarga: "Prasejahtera",
      persentaseKelayakan: 85,
    }
  });
  console.log("✅ KPS Dummy Seeded");

  // 3. UMKM Data
  const umkm = await prisma.umkmData.create({
    data: {
      namaPemilik: "Ibu Siti (Dummy)",
      namaUsaha: "Warung Nasi Siti",
      lingkunganId: lingkunganId,
      asetTotal: 15000000,
      omsetTahunan: 50000000,
      createdBy: userId,
      statusKelayakan: true,
    }
  });
  console.log("✅ UMKM Dummy Seeded");

  // 4. SPB Data
  const spb1 = await prisma.spbRequest.create({
    data: {
      nomorSpb: `SPB/2026/0001-${Date.now()}`,
      lingkunganId: lingkunganId,
      intensiId: intensi.id,
      kpsId: kps.id,
      kategoriBantuan: "Pangan",
      alasanBantuan: "Bantuan sembako bulanan untuk keluarga prasejahtera",
      totalBiaya: 500000,
      danaSwadaya: 0,
      danaLingkungan: 100000,
      danaParokiRequested: 400000,
      status: "SUBMITTED",
      createdBy: userId,
    }
  });

  const spb2 = await prisma.spbRequest.create({
    data: {
      nomorSpb: `SPB/2026/0002-${Date.now()}`,
      lingkunganId: lingkunganId,
      intensiId: intensi.id,
      umkmId: umkm.id,
      kategoriBantuan: "Bantuan Modal Usaha",
      alasanBantuan: "Tambahan modal untuk gerobak baru",
      totalBiaya: 2000000,
      danaSwadaya: 500000,
      danaLingkungan: 500000,
      danaParokiRequested: 1000000,
      danaParokiApproved: 1000000,
      status: "APPROVED_PASTOR", // Siap dicairkan
      createdBy: userId,
      updatedBy: userId,
    }
  });
  console.log("✅ SPB Dummy Seeded");

  // 5. Financial Mutation (Initial Balance)
  await prisma.financialMutation.create({
    data: {
      intensiId: intensi.id,
      type: "IN",
      amount: 50000000,
      sourceType: "APP",
      description: "Saldo Awal Kas APP",
      createdBy: userId,
    }
  });
  console.log("✅ Financial Mutation Dummy Seeded");

  console.log("🎉 Seeding Dummy Selesai!");
}

runSeeder()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
