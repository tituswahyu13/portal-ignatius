"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- INTENSI ACCOUNT ACTIONS ---

export async function getIntensiAccounts() {
  try {
    const rawData = await prisma.intensiAccount.findMany({
      orderBy: { id: 'asc' }
    });
    
    // Convert Decimal to string
    return rawData.map(account => ({
      ...account,
      saldo: account.saldo.toString()
    }));
  } catch (error) {
    console.error("Gagal mengambil daftar akun intensi:", error);
    return [];
  }
}

export async function createIntensiAction(formData: FormData) {
  try {
    const kodeAccount = formData.get("kodeAccount") as string;
    const namaIntensi = formData.get("namaIntensi") as string;
    const saldoAwal = parseFloat(formData.get("saldo") as string || "0");

    if (!kodeAccount || !namaIntensi) {
      return { success: false, error: "Kode dan Nama Akun wajib diisi" };
    }

    const exist = await prisma.intensiAccount.findFirst({
      where: { kodeAccount }
    });

    if (exist) {
      return { success: false, error: "Kode Akun sudah terdaftar" };
    }

    await prisma.intensiAccount.create({
      data: {
        kodeAccount,
        namaIntensi,
        saldo: saldoAwal
      }
    });

    revalidatePath("/dansospar/keuangan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan Akun Intensi:", error);
    return { success: false, error: "Gagal menyimpan data" };
  }
}

export async function updateIntensiAction(id: number, formData: FormData) {
  try {
    const kodeAccount = formData.get("kodeAccount") as string;
    const namaIntensi = formData.get("namaIntensi") as string;
    const saldo = parseFloat(formData.get("saldo") as string || "0");

    if (!kodeAccount || !namaIntensi) {
      return { success: false, error: "Kode dan Nama Akun wajib diisi" };
    }

    await prisma.intensiAccount.update({
      where: { id },
      data: {
        kodeAccount,
        namaIntensi,
        saldo
      }
    });

    revalidatePath("/dansospar/keuangan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui Akun Intensi:", error);
    return { success: false, error: "Gagal memperbarui data" };
  }
}

export async function deleteIntensiAction(id: number) {
  try {
    await prisma.intensiAccount.delete({
      where: { id }
    });
    revalidatePath("/dansospar/keuangan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus Akun Intensi:", error);
    return { success: false, error: "Gagal menghapus data (Mungkin sudah ada transaksi yang terhubung)" };
  }
}

// --- MUTASI KEUANGAN ACTIONS ---

export async function getMutations() {
  try {
    const rawData = await prisma.financialMutation.findMany({
      include: {
        intensiAccount: true,
        creator: {
          select: { name: true }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 100 // Get latest 100 transactions
    });

    return rawData.map(mutation => ({
      ...mutation,
      id: mutation.id.toString(),
      amount: mutation.amount.toString(),
    }));
  } catch (error) {
    console.error("Gagal mengambil riwayat mutasi:", error);
    return [];
  }
}

export async function createMutationAction(formData: FormData) {
  try {
    const intensiId = parseInt(formData.get("intensiId") as string);
    const type = formData.get("type") as "IN" | "OUT";
    const amount = parseFloat(formData.get("amount") as string);
    const sourceType = formData.get("sourceType") as any;
    const referenceId = formData.get("referenceId") as string;
    const description = formData.get("description") as string;

    if (!intensiId || !type || !amount || !sourceType) {
      return { success: false, error: "Data mutasi tidak lengkap" };
    }

    if (amount <= 0) {
      return { success: false, error: "Nominal harus lebih besar dari 0" };
    }

    // Gunakan Prisma Transaction agar atomik
    await prisma.$transaction(async (tx) => {
      // 1. Catat mutasi
      await tx.financialMutation.create({
        data: {
          intensiId,
          type,
          amount,
          sourceType,
          referenceId,
          description,
          // createdBy: TODO (ambil dari session)
        }
      });

      // 2. Update saldo akun intensi
      if (type === "IN") {
        await tx.intensiAccount.update({
          where: { id: intensiId },
          data: { saldo: { increment: amount } }
        });
      } else if (type === "OUT") {
        await tx.intensiAccount.update({
          where: { id: intensiId },
          data: { saldo: { decrement: amount } }
        });
      }
    });

    revalidatePath("/dansospar/keuangan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal mencatat mutasi:", error);
    return { success: false, error: "Terjadi kesalahan saat mencatat transaksi" };
  }
}
