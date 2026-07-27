import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const intensiDasar = [
  { kodeAccount: "INT-PPM", namaIntensi: "Dana Papa Miskin" },
  { kodeAccount: "INT-APP", namaIntensi: "Dana APP Paroki" },
  { kodeAccount: "INT-PND", namaIntensi: "Dana Bantuan Pendidikan" },
  { kodeAccount: "INT-KSH", namaIntensi: "Dana Bantuan Kesehatan" },
  { kodeAccount: "INT-PRT", namaIntensi: "Dana Bantuan Pangruktilaya" },
  { kodeAccount: "INT-SMN", namaIntensi: "Dana Bantuan Seminari" },
  { kodeAccount: "INT-BNC", namaIntensi: "Dana Bantuan Bencana" },
];

async function main() {
  console.log("Memulai proses input Akun Intensi Dasar...");

  for (const intensi of intensiDasar) {
    const exist = await prisma.intensiAccount.findFirst({
      where: { kodeAccount: intensi.kodeAccount }
    });

    if (!exist) {
      await prisma.intensiAccount.create({
        data: {
          kodeAccount: intensi.kodeAccount,
          namaIntensi: intensi.namaIntensi,
          saldo: 0
        }
      });
      console.log(`✅ Berhasil menambahkan Akun Intensi: ${intensi.namaIntensi}`);
    } else {
      console.log(`ℹ️ Akun Intensi sudah ada: ${intensi.namaIntensi}`);
    }
  }

  console.log("🎉 Proses penambahan Akun Intensi selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
