import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const daftarLingkungan = [
  "Carolus 1", "Carolus 2", "Carolus 3",
  "Cornelius 1", "Cornelius 2", "Cornelius 3",
  "Giovani 1", "Giovani 2", "Giovani 3",
  "Gregorius 1", "Gregorius 2", "Gregorius 3",
  "Katarina 1", "Katarina 2", "Katarina 3",
  "Margaretha 1", "Margaretha 2",
  "Maria 1", "Maria 2",
  "Monica 1", "Monica 2", "Monica 3",
  "Paulus 1", "Paulus 2", "Paulus 3", "Paulus 4",
  "Rafael 1", "Rafael 2", "Rafael 3", "Rafael 4",
  "Robertus 1", "Robertus 2", "Robertus 3",
  "Theodorus 1", "Theodorus 2", "Theodorus 3",
  "Yohanes 1", "Yohanes 2", "Yohanes 3"
];

async function main() {
  console.log("Memulai proses input daftar Lingkungan...");

  for (const namaLingkungan of daftarLingkungan) {
    // Ambil kata pertama sebagai nama Wilayah (contoh: "Carolus 1" -> Wilayah: "Carolus")
    const wilayah = namaLingkungan.split(" ")[0];

    const exist = await prisma.lingkungan.findFirst({
      where: { namaLingkungan }
    });

    if (!exist) {
      await prisma.lingkungan.create({
        data: {
          namaLingkungan,
          wilayah
        }
      });
      console.log(`✅ Berhasil menambahkan Lingkungan: ${namaLingkungan} (Wilayah ${wilayah})`);
    } else {
      console.log(`ℹ️ Lingkungan sudah ada: ${namaLingkungan}`);
    }
  }

  console.log("🎉 Proses penambahan Lingkungan selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
