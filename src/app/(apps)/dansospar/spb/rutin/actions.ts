"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser, hasPermission } from "@/lib/auth/permissions";

// 1. Dapatkan daftar KPS di lingkungan untuk dropdown
export async function getKpsForRoutineSpb(lingkunganId?: number) {
  const where = lingkunganId ? { lingkunganId } : {};
  return await prisma.kpsData.findMany({
    where,
    orderBy: { namaKepalaKeluarga: 'asc' },
    select: { id: true, namaKepalaKeluarga: true, lingkungan: { select: { namaLingkungan: true } } }
  });
}

// 2. Daftarkan SPB Rutin Baru
export async function addRecurringSpbAction(formData: FormData) {
  try {
    const kpsId = formData.get("kpsId") as string;
    const intensiId = formData.get("intensiId") as string;
    const kategoriBantuan = formData.get("kategoriBantuan") as string;
    const nominalBantuan = formData.get("nominalBantuan") as string;

    if (!kpsId || !intensiId || !kategoriBantuan || !nominalBantuan) {
      return { success: false, error: "Semua kolom wajib diisi" };
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Sesi tidak valid." };

    await prisma.recurringSpb.create({
      data: {
        kpsId: BigInt(kpsId),
        intensiId: parseInt(intensiId),
        kategoriBantuan,
        nominalBantuan: parseFloat(nominalBantuan),
        createdBy: currentUser.id,
      }
    });

    revalidatePath("/dansospar/spb/rutin");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menambahkan SPB rutin:", error);
    return { success: false, error: error.message || "Gagal menyimpan data" };
  }
}

// 3. Ubah Status Aktif SPB Rutin
export async function toggleRecurringSpbAction(id: bigint, isActive: boolean) {
  try {
    await prisma.recurringSpb.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/dansospar/spb/rutin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal memperbarui status" };
  }
}

// 4. GENERATE SPB RUTIN BULAN INI (MASSAL)
export async function generateMonthlyRoutineSpbAction(monthStr: string) {
  try {
    // 1. Pastikan yang generate adalah admin yang berhak
    const canRealize = await hasPermission("SPB_RUTIN_MANAGE");
    if (!canRealize) {
      return { success: false, error: "Akses ditolak. Hanya user dengan hak SPB_RUTIN_MANAGE yang dapat menggenerate SPB massal." };
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Unauthorized" };

    // 2. Ambil semua SPB rutin yang aktif
    const activeRoutines = await prisma.recurringSpb.findMany({
      where: { isActive: true },
      include: { kpsData: true }
    });

    if (activeRoutines.length === 0) {
      return { success: false, error: "Belum ada daftar KPS penerima SPB Rutin yang aktif." };
    }

    // 3. Filter yang belum di-generate bulan ini
    const toGenerate = activeRoutines.filter(r => r.lastGeneratedMonth !== monthStr);

    if (toGenerate.length === 0) {
      return { success: false, error: "Semua SPB Rutin untuk bulan ini sudah selesai di-generate sebelumnya." };
    }

    let generatedCount = 0;

    // 4. Proses generate dengan Transaction
    await prisma.$transaction(async (tx) => {
      for (const routine of toGenerate) {
        const nominal = routine.nominalBantuan;
        
        // Buat Nomor SPB (RUTIN/YYYY-MM/ID)
        const countSpb = await tx.spbRequest.count({ where: { kategoriBantuan: routine.kategoriBantuan } });
        let prefix = "SPB";
        switch (routine.kategoriBantuan) {
          case "Pangan": prefix = "PNG"; break;
          case "Sandang": prefix = "SND"; break;
          case "Pendidikan": prefix = "PDD"; break;
          case "Kesehatan": prefix = "KSH"; break;
          default: prefix = "RTN"; break;
        }
        const nomorSpb = `${prefix}/${monthStr.replace('-', '')}/${(countSpb + 1).toString().padStart(4, '0')}`;

        // Create the SPB Request as REALIZED (Sesuai persetujuan user)
        const spb = await tx.spbRequest.create({
          data: {
            nomorSpb,
            lingkunganId: routine.kpsData.lingkunganId,
            intensiId: routine.intensiId,
            kpsId: routine.kpsId,
            kategoriBantuan: routine.kategoriBantuan,
            totalBiaya: nominal,
            danaSwadaya: 0,
            danaLingkungan: 0,
            danaParokiRequested: nominal,
            danaParokiApproved: nominal, // Langsung disetujui
            status: "REALIZED",          // Langsung REALIZED
            alasanBantuan: `Bantuan Rutin Bulanan (${monthStr})`,
            createdBy: currentUser.id,
          }
        });

        // Catat Financial Mutation (Potong Saldo)
        await tx.financialMutation.create({
          data: {
            intensiId: routine.intensiId,
            type: "OUT",
            amount: nominal,
            sourceType: "SPB_REALIZATION",
            referenceId: nomorSpb,
            description: `Pencairan dana SPB RUTIN untuk ${nomorSpb} - ${routine.kpsData.namaKepalaKeluarga}`,
            createdBy: currentUser.id,
          }
        });

        // Kurangi saldo Intensi Account
        await tx.intensiAccount.update({
          where: { id: routine.intensiId },
          data: { saldo: { decrement: nominal } }
        });

        // Update lastGeneratedMonth pada routine
        await tx.recurringSpb.update({
          where: { id: routine.id },
          data: { lastGeneratedMonth: monthStr }
        });

        generatedCount++;
      }
    });

    revalidatePath("/dansospar/spb/rutin");
    revalidatePath("/dansospar/spb");
    revalidatePath("/dansospar/keuangan");
    revalidatePath("/dansospar");

    return { success: true, message: `Berhasil meng-generate ${generatedCount} SPB Rutin dan mencairkan dananya.` };

  } catch (error: any) {
    console.error("Gagal generate SPB massal:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat SPB massal." };
  }
}
