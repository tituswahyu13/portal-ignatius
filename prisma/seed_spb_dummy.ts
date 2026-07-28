import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses pembuatan data dummy SPB dan Kas & Intensi...");

  // 1. Ambil admin user
  const admin = await prisma.user.findFirst({
    where: { email: "admin@portal-ignatius.local" }
  });

  if (!admin) {
    console.error("User admin belum ada. Pastikan sudah menjalankan seed_users.ts");
    process.exit(1);
  }

  // 2. Buat mutasi pemasukan (IN) untuk beberapa kas intensi agar memiliki saldo
  const intensi1 = await prisma.intensiAccount.findUnique({ where: { kodeAccount: "INT-PPM" } }); // Dana Papa Miskin
  const intensi2 = await prisma.intensiAccount.findUnique({ where: { kodeAccount: "INT-APP" } }); // Dana APP
  const intensi3 = await prisma.intensiAccount.findUnique({ where: { kodeAccount: "INT-PND" } }); // Dana Pendidikan

  if (intensi1 && intensi2 && intensi3) {
    console.log("Menambahkan mutasi uang masuk...");
    
    // Tambah saldo PPM 50jt
    await prisma.financialMutation.create({
      data: {
        intensiId: intensi1!.id,
        type: "IN",
        amount: 50000000,
        sourceType: "DONASI",
        description: "Donasi umat awal bulan",
        createdBy: admin.id
      }
    });
    await prisma.intensiAccount.update({ where: { id: intensi1!.id }, data: { saldo: { increment: 50000000 } } });

    // Tambah saldo APP 20jt
    await prisma.financialMutation.create({
      data: {
        intensiId: intensi2!.id,
        type: "IN",
        amount: 20000000,
        sourceType: "APP",
        description: "Kolekte APP Prapaskah",
        createdBy: admin.id
      }
    });
    await prisma.intensiAccount.update({ where: { id: intensi2!.id }, data: { saldo: { increment: 20000000 } } });

    // Tambah saldo Pendidikan 15jt
    await prisma.financialMutation.create({
      data: {
        intensiId: intensi3!.id,
        type: "IN",
        amount: 15000000,
        sourceType: "KOLEKTE",
        description: "Kolekte Misa Minggu ke-2",
        createdBy: admin.id
      }
    });
    await prisma.intensiAccount.update({ where: { id: intensi3!.id }, data: { saldo: { increment: 15000000 } } });
  }

  // 3. Ambil data KPS dan Lingkungan untuk dummy SPB
  const kps = await prisma.kpsData.findFirst();
  const lingkungan = await prisma.lingkungan.findFirst();

  if (kps && lingkungan && intensi1) {
    console.log("Membuat pengajuan SPB dummy...");

    // SPB 1: Submitted
    await prisma.spbRequest.create({
      data: {
        nomorSpb: "SPB/2026/0001",
        lingkunganId: kps.lingkunganId,
        kpsId: kps.id,
        intensiId: intensi1!.id, // Dana Papa Miskin
        kategoriBantuan: "Pangan",
        totalBiaya: 1000000,
        danaSwadaya: 100000,
        danaLingkungan: 200000,
        danaParokiRequested: 700000,
        status: "SUBMITTED",
        createdBy: admin.id
      }
    });

    // SPB 2: Approved Pastor
    await prisma.spbRequest.create({
      data: {
        nomorSpb: "SPB/2026/0002",
        lingkunganId: kps.lingkunganId,
        kpsId: kps.id,
        intensiId: intensi3!.id, // Dana Pendidikan
        kategoriBantuan: "Pendidikan",
        totalBiaya: 5000000,
        danaSwadaya: 500000,
        danaLingkungan: 500000,
        danaParokiRequested: 4000000,
        status: "APPROVED_PASTOR",
        createdBy: admin.id
      }
    });
    
    // SPB 3: Realized (Sudah cair)
    await prisma.$transaction(async (tx) => {
      const spbRealized = await tx.spbRequest.create({
        data: {
          nomorSpb: "SPB/2026/0003",
          lingkunganId: kps.lingkunganId,
          kpsId: kps.id,
          intensiId: intensi2!.id, // Dana APP
          kategoriBantuan: "Papan (Bedah Rumah)",
          totalBiaya: 10000000,
          danaSwadaya: 2000000,
          danaLingkungan: 1000000,
          danaParokiRequested: 7000000,
          status: "REALIZED",
          createdBy: admin.id
        }
      });

      // Potong saldo
      await tx.financialMutation.create({
        data: {
          intensiId: intensi2!.id,
          type: "OUT",
          amount: 7000000,
          sourceType: "SPB_REALIZATION",
          referenceId: spbRealized.nomorSpb,
          description: `Pencairan dana untuk ${spbRealized.nomorSpb} - ${spbRealized.kategoriBantuan}`,
          createdBy: admin.id
        }
      });

      await tx.intensiAccount.update({
        where: { id: intensi2!.id },
        data: { saldo: { decrement: 7000000 } }
      });
    });

  }

  console.log("🎉 Proses penambahan dummy SPB, Kas & Mutasi selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
