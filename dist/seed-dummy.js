"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/lib/db");
const encryption_1 = require("./src/lib/encryption");
async function runSeeder() {
    console.log("Menjalankan Seeder Data Dummy...");
    const adminUser = await db_1.db.user.findFirst();
    if (!adminUser) {
        console.log("❌ Tidak ada user, harap jalankan prisma db seed terlebih dahulu.");
        return;
    }
    const lingkungan = await db_1.db.lingkungan.findFirst();
    if (!lingkungan) {
        console.log("❌ Tidak ada lingkungan, harap jalankan prisma db seed terlebih dahulu.");
        return;
    }
    const userId = adminUser.id;
    const lingkunganId = lingkungan.id;
    // 1. Kas Intensi
    const intensi = await db_1.db.intensiAccount.upsert({
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
    const nikEnc = (0, encryption_1.encryptString)("3301111111111111");
    const kkEnc = (0, encryption_1.encryptString)("3301112222222222");
    const kps = await db_1.db.kpsData.create({
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
    const umkm = await db_1.db.umkmData.create({
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
    const spb1 = await db_1.db.spbRequest.create({
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
    const spb2 = await db_1.db.spbRequest.create({
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
    await db_1.db.financialMutation.create({
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
    await db_1.db.$disconnect();
});
