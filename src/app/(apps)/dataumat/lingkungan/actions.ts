"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLingkungans() {
  try {
    const data = await prisma.lingkungan.findMany({
      orderBy: { namaLingkungan: 'asc' }
    });
    return data;
  } catch (error) {
    console.error("Error fetching lingkungans:", error);
    return [];
  }
}

export async function createLingkungan(formData: FormData) {
  try {
    const namaLingkungan = formData.get("namaLingkungan") as string;
    const wilayah = formData.get("wilayah") as string;

    if (!namaLingkungan || !wilayah) {
      return { success: false, message: "Nama Lingkungan dan Wilayah harus diisi" };
    }

    await prisma.lingkungan.create({
      data: {
        namaLingkungan,
        wilayah
      }
    });

    revalidatePath("/dataumat/lingkungan");
    return { success: true };
  } catch (error) {
    console.error("Error creating lingkungan:", error);
    return { success: false, message: "Gagal membuat lingkungan" };
  }
}

export async function updateLingkungan(id: number, formData: FormData) {
  try {
    const namaLingkungan = formData.get("namaLingkungan") as string;
    const wilayah = formData.get("wilayah") as string;

    if (!namaLingkungan || !wilayah) {
      return { success: false, message: "Nama Lingkungan dan Wilayah harus diisi" };
    }

    await prisma.lingkungan.update({
      where: { id },
      data: {
        namaLingkungan,
        wilayah
      }
    });

    revalidatePath("/dataumat/lingkungan");
    return { success: true };
  } catch (error) {
    console.error("Error updating lingkungan:", error);
    return { success: false, message: "Gagal mengupdate lingkungan" };
  }
}

export async function deleteLingkungan(id: number) {
  try {
    // Check if it's used
    const checkKps = await prisma.kpsData.count({ where: { lingkunganId: id } });
    const checkUmat = await prisma.dataUmat.count({ where: { lingkunganId: id } });
    const checkUmkm = await prisma.umkmData.count({ where: { lingkunganId: id } });
    
    if (checkKps > 0 || checkUmat > 0 || checkUmkm > 0) {
      return { success: false, message: "Lingkungan tidak bisa dihapus karena masih digunakan di KPS/Umat/UMKM" };
    }

    await prisma.lingkungan.delete({
      where: { id }
    });

    revalidatePath("/dataumat/lingkungan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting lingkungan:", error);
    return { success: false, message: "Gagal menghapus lingkungan" };
  }
}

export async function deleteLingkunganBatch(ids: number[]) {
  try {
    const failedIds: number[] = [];
    
    for (const id of ids) {
      // Check if it's used
      const checkKps = await prisma.kpsData.count({ where: { lingkunganId: id } });
      const checkUmat = await prisma.dataUmat.count({ where: { lingkunganId: id } });
      const checkUmkm = await prisma.umkmData.count({ where: { lingkunganId: id } });
      
      if (checkKps > 0 || checkUmat > 0 || checkUmkm > 0) {
        failedIds.push(id);
      } else {
        await prisma.lingkungan.delete({ where: { id } });
      }
    }

    revalidatePath("/dataumat/lingkungan");

    if (failedIds.length > 0) {
      return { success: false, message: `Berhasil dihapus, namun ${failedIds.length} lingkungan gagal karena masih digunakan di KPS/Umat/UMKM.` };
    }

    return { success: true };
  } catch (error) {
    console.error("Error batch deleting lingkungan:", error);
    return { success: false, message: "Gagal menghapus lingkungan secara massal" };
  }
}
