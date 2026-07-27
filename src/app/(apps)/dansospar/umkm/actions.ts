"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createUmkmAction(formData: FormData) {
  try {
    const namaPemilik = formData.get("namaPemilik") as string;
    const namaUsaha = formData.get("namaUsaha") as string;
    const jenisUsaha = formData.get("jenisUsaha") as string;
    const asetTotal = parseFloat(formData.get("asetTotal") as string || "0");
    const omsetTahunan = parseFloat(formData.get("omsetTahunan") as string || "0");
    const nib = formData.get("nib") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    
    // Status kelayakan otomatis (Aset <= 20jt, Omset <= 100jt)
    const isLayak = asetTotal <= 20000000 && omsetTahunan <= 100000000;

    if (!namaPemilik || !namaUsaha || !lingkunganId) {
      return { success: false, error: "Nama pemilik, usaha, dan lingkungan wajib diisi" };
    }

    await prisma.umkmData.create({
      data: {
        namaPemilik,
        namaUsaha,
        jenisUsaha,
        asetTotal,
        omsetTahunan,
        nib,
        lingkunganId,
        statusKelayakan: isLayak,
      }
    });

    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan UMKM:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function getUmkmData() {
  try {
    const rawData = await prisma.umkmData.findMany({
      include: {
        lingkungan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert BigInt id and Decimal to string for UI
    return rawData.map(umkm => ({
      ...umkm,
      id: umkm.id.toString(),
      asetTotal: umkm.asetTotal ? umkm.asetTotal.toString() : "0",
      omsetTahunan: umkm.omsetTahunan ? umkm.omsetTahunan.toString() : "0",
    }));
  } catch (error) {
    console.error("Gagal mengambil data UMKM:", error);
    return [];
  }
}

export async function updateUmkmAction(id: string, formData: FormData) {
  try {
    const namaPemilik = formData.get("namaPemilik") as string;
    const namaUsaha = formData.get("namaUsaha") as string;
    const jenisUsaha = formData.get("jenisUsaha") as string;
    const asetTotal = parseFloat(formData.get("asetTotal") as string || "0");
    const omsetTahunan = parseFloat(formData.get("omsetTahunan") as string || "0");
    const nib = formData.get("nib") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    
    // Status kelayakan otomatis (Aset <= 20jt, Omset <= 100jt)
    const isLayak = asetTotal <= 20000000 && omsetTahunan <= 100000000;

    if (!namaPemilik || !namaUsaha || !lingkunganId) {
      return { success: false, error: "Nama pemilik, usaha, dan lingkungan wajib diisi" };
    }

    await prisma.umkmData.update({
      where: { id: BigInt(id) },
      data: {
        namaPemilik,
        namaUsaha,
        jenisUsaha,
        asetTotal,
        omsetTahunan,
        nib,
        lingkunganId,
        statusKelayakan: isLayak,
      }
    });

    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui UMKM:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function deleteUmkmAction(id: string) {
  try {
    await prisma.umkmData.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus UMKM:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
