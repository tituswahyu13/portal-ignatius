"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/lib/db");
async function runTest() {
    console.log("Memulai uji coba Prisma Safe Actions...");
    // 1. Ambil sembarang user dan lingkungan
    const user = await db_1.db.user.findFirst();
    if (!user) {
        console.log("❌ Tidak ada user di database untuk pengujian.");
        return;
    }
    const lingkungan = await db_1.db.lingkungan.findFirst();
    if (!lingkungan) {
        console.log("❌ Tidak ada lingkungan di database untuk pengujian.");
        return;
    }
    const userId = user.id;
    const lingkunganId = lingkungan.id;
    console.log(`Menggunakan User ID: ${userId}, Lingkungan ID: ${lingkunganId}`);
    // 2. Test safeCreate
    console.log("\n[1/4] Menguji safeCreate...");
    const umkm = await db_1.db.umkmData.safeCreate({
        data: {
            namaPemilik: "Test Pemilik",
            namaUsaha: "Test Usaha",
            lingkunganId: lingkunganId,
            statusKelayakan: true,
        }
    }, userId);
    console.log("UMKM Dibuat:", umkm);
    if (umkm.createdBy === userId) {
        console.log("✅ createdBy berhasil tercatat!");
    }
    else {
        console.log("❌ createdBy GAGAL tercatat!");
    }
    // 3. Test safeUpdate
    console.log("\n[2/4] Menguji safeUpdate...");
    const updatedUmkm = await db_1.db.umkmData.safeUpdate({
        where: { id: umkm.id },
        data: { namaUsaha: "Usaha Diupdate" }
    }, userId);
    console.log("UMKM Diupdate:", updatedUmkm);
    if (updatedUmkm.updatedBy === userId && updatedUmkm.namaUsaha === "Usaha Diupdate") {
        console.log("✅ updatedBy berhasil tercatat!");
    }
    else {
        console.log("❌ updatedBy GAGAL tercatat!");
    }
    // 4. Test softDelete
    console.log("\n[3/4] Menguji softDelete...");
    const deletedUmkm = await db_1.db.umkmData.softDelete({ id: umkm.id }, userId);
    console.log("UMKM Dihapus:", deletedUmkm);
    if (deletedUmkm.deletedBy === userId && deletedUmkm.deletedAt !== null) {
        console.log("✅ deletedBy dan deletedAt berhasil tercatat!");
    }
    else {
        console.log("❌ softDelete GAGAL mencatat data!");
    }
    // 5. Verifikasi penyaringan otomatis (findMany)
    console.log("\n[4/4] Memverifikasi apakah data yang dihapus disembunyikan...");
    const searchResult = await db_1.db.umkmData.findMany({
        where: { id: umkm.id }
    });
    if (searchResult.length === 0) {
        console.log("✅ Data berhasil disembunyikan dari hasil pencarian normal!");
    }
    else {
        console.log("❌ Data MASIH MUNCUL di hasil pencarian! Filter deletedAt gagal.");
    }
    console.log("\nUji coba selesai!");
}
runTest()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.db.$disconnect();
});
