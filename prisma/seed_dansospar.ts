import { PrismaClient } from '@prisma/client';
import { encryptString } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai seeding dummy data KPS dan UMKM...");

  // Cari lingkungan pertama sebagai target dummy
  const lingkungan = await prisma.lingkungan.findFirst();
  if (!lingkungan) {
    console.error("❌ Tidak ada data Lingkungan. Harap buat Lingkungan terlebih dahulu.");
    return;
  }

  // 1. DUMMY KPS
  const dummyKps = [
    {
      namaKepalaKeluarga: "Bapak Budi Santoso",
      nik: "3308123456780001",
      kk: "3308000011112222",
      alamat: "Jl. Mawar No 10, Magelang",
      skorPekerjaan: 1,
      skorSandang: 1,
      skorPangan: 1,
      skorPapan: 1,
      skorKesehatan: 2,
      skorPendidikan: 1,
      skorSosial: 1,
      totalSkor: 8,
      persentaseKelayakan: 38.09,
      statusKeluarga: "Prasejahtera"
    },
    {
      namaKepalaKeluarga: "Ibu Siti Aminah (Janda)",
      nik: "3308987654320002",
      kk: "3308000033334444",
      alamat: "Kampung Krajan, RT 02 RW 03",
      skorPekerjaan: 2,
      skorSandang: 2,
      skorPangan: 2,
      skorPapan: 1,
      skorKesehatan: 1,
      skorPendidikan: 2,
      skorSosial: 2,
      totalSkor: 12,
      persentaseKelayakan: 57.14,
      statusKeluarga: "Prasejahtera"
    },
    {
      namaKepalaKeluarga: "Bapak Joko Susilo",
      nik: "3308555555550003",
      kk: "3308000066667777",
      alamat: "Perumahan Indah Asri Blok C2",
      skorPekerjaan: 3,
      skorSandang: 3,
      skorPangan: 3,
      skorPapan: 3,
      skorKesehatan: 3,
      skorPendidikan: 0, // N/A, tidak punya anak
      skorSosial: 3,
      totalSkor: 18,
      persentaseKelayakan: 100, // 18 / (6*3)
      statusKeluarga: "Sejahtera"
    }
  ];

  for (const kps of dummyKps) {
    const umat = await prisma.dataUmat.findFirst({
      where: { nama: kps.namaKepalaKeluarga, lingkunganId: lingkungan.id }
    });
    
    let umatId;
    if (umat) {
      umatId = umat.id;
    } else {
      const newUmat = await prisma.dataUmat.create({
        data: {
          nama: kps.namaKepalaKeluarga,
          lingkunganId: lingkungan.id,
          kkEncrypted: encryptString(kps.kk),
          nikEncrypted: encryptString(kps.nik),
          alamat: kps.alamat
        }
      });
      umatId = newUmat.id;
    }

    const kpsExists = await prisma.kpsData.findFirst({
      where: { umatId }
    });

    if (!kpsExists) {
      await prisma.kpsData.create({
        data: {
          lingkunganId: lingkungan.id,
          umatId,
          skorPekerjaan: kps.skorPekerjaan,
          skorSandang: kps.skorSandang,
          skorPangan: kps.skorPangan,
          skorPapan: kps.skorPapan,
          skorKesehatan: kps.skorKesehatan,
          skorPendidikan: kps.skorPendidikan,
          skorSosial: kps.skorSosial,
          totalSkor: kps.totalSkor,
          persentaseKelayakan: kps.persentaseKelayakan,
          statusKeluarga: kps.statusKeluarga
        }
      });
      console.log(`✅ Berhasil menambahkan KPS: ${kps.namaKepalaKeluarga}`);
    } else {
      console.log(`ℹ️ KPS sudah ada: ${kps.namaKepalaKeluarga}`);
    }
  }

  // 2. DUMMY UMKM
  const dummyUmkm = [
    {
      namaPemilik: "Bapak Tono",
      namaUsaha: "Gorengan Pak Tono",
      jenisUsaha: "Kuliner",
      asetTotal: 5000000,
      omsetTahunan: 36000000,
      nib: "",
      statusKelayakan: true
    },
    {
      namaPemilik: "Bapak Haji Slamet",
      namaUsaha: "Minimarket Barokah",
      jenisUsaha: "Perdagangan",
      asetTotal: 150000000,
      omsetTahunan: 500000000,
      nib: "91203912039102",
      statusKelayakan: false // Melebihi batas aset dan omset
    },
    {
      namaPemilik: "Ibu Ina",
      namaUsaha: "Kerajinan Rotan Ibu Ina",
      jenisUsaha: "Kerajinan",
      asetTotal: 12000000,
      omsetTahunan: 45000000,
      nib: "82394829384",
      statusKelayakan: true
    }
  ];

  for (const umkm of dummyUmkm) {
    const umat = await prisma.dataUmat.findFirst({
      where: { nama: umkm.namaPemilik, lingkunganId: lingkungan.id }
    });
    
    let umatId;
    if (umat) {
      umatId = umat.id;
    } else {
      const newUmat = await prisma.dataUmat.create({
        data: {
          nama: umkm.namaPemilik,
          lingkunganId: lingkungan.id
        }
      });
      umatId = newUmat.id;
    }

    const umkmExists = await prisma.umkmData.findFirst({
      where: { namaUsaha: umkm.namaUsaha, umatId }
    });

    if (!umkmExists) {
      await prisma.umkmData.create({
        data: {
          lingkunganId: lingkungan.id,
          umatId,
          namaUsaha: umkm.namaUsaha,
          jenisUsaha: umkm.jenisUsaha,
          asetTotal: umkm.asetTotal,
          omsetTahunan: umkm.omsetTahunan,
          nib: umkm.nib,
          statusKelayakan: umkm.statusKelayakan
        }
      });
      console.log(`✅ Berhasil menambahkan UMKM: ${umkm.namaUsaha}`);
    } else {
      console.log(`ℹ️ UMKM sudah ada: ${umkm.namaUsaha}`);
    }
  }

  console.log("🎉 Seeding dummy DanSosPar selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
