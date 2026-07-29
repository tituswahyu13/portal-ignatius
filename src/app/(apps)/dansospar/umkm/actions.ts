"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encryptString, decryptString } from "@/lib/encryption";
import { getLingkunganRestriction, getCurrentUser } from "@/lib/auth/permissions";

export async function createUmkmAction(formData: FormData) {
  try {
    const namaPemilik = formData.get("namaPemilik") as string;
    const namaUsaha = formData.get("namaUsaha") as string;
    const jenisUsaha = formData.get("jenisUsaha") as string;
    const asetTotalStr = formData.get("asetTotal") as string;
    const asetTotal = asetTotalStr ? parseFloat(asetTotalStr) : null;
    
    const omsetTahunanStr = formData.get("omsetTahunan") as string;
    const omsetTahunan = omsetTahunanStr ? parseFloat(omsetTahunanStr) : null;
    
    const nib = formData.get("nib") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    const nik = formData.get("nik") as string;
    const kpsId = formData.get("kpsId") as string;
    
    const nikEncrypted = nik ? encryptString(nik) : null;
    const kpsIdBigInt = kpsId ? BigInt(kpsId) : null;
    
    // Status kelayakan otomatis (Aset <= 20jt, Omset <= 100jt). Jika kosong, dianggap memenuhi syarat.
    const isLayak = (asetTotal === null || asetTotal <= 20000000) && (omsetTahunan === null || omsetTahunan <= 100000000);

    if (!namaPemilik || !namaUsaha || !lingkunganId) {
      return { success: false, error: "Nama pemilik, usaha, dan lingkungan wajib diisi" };
    }

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Anda hanya dapat membuat data untuk lingkungan Anda sendiri." };
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.umkmData.safeCreate({
      data: {
        namaPemilik,
        namaUsaha,
        jenisUsaha,
        asetTotal,
        omsetTahunan,
        nib,
        lingkunganId,
        nikEncrypted,
        kpsId: kpsIdBigInt,
        statusKelayakan: isLayak,
      }
    }, user.id);

    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan UMKM:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function getUmkmData() {
  try {
    const restriction = await getLingkunganRestriction();
    const whereClause = restriction.restricted 
      ? { lingkunganId: restriction.lingkunganId }
      : {};

    const rawData = await prisma.umkmData.findMany({
      where: whereClause,
      include: {
        lingkungan: true,
        kpsData: true,
        creator: { select: { name: true } },
        updater: { select: { name: true } }
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
      nik: umkm.nikEncrypted ? decryptString(umkm.nikEncrypted) : null,
      kpsId: umkm.kpsId ? umkm.kpsId.toString() : null,
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
    const asetTotalStr = formData.get("asetTotal") as string;
    const asetTotal = asetTotalStr ? parseFloat(asetTotalStr) : null;
    
    const omsetTahunanStr = formData.get("omsetTahunan") as string;
    const omsetTahunan = omsetTahunanStr ? parseFloat(omsetTahunanStr) : null;
    
    const nib = formData.get("nib") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    const nik = formData.get("nik") as string;
    const kpsId = formData.get("kpsId") as string;
    
    const nikEncrypted = nik ? encryptString(nik) : null;
    const kpsIdBigInt = kpsId ? BigInt(kpsId) : null;
    
    // Status kelayakan otomatis (Aset <= 20jt, Omset <= 100jt). Jika kosong, dianggap memenuhi syarat.
    const isLayak = (asetTotal === null || asetTotal <= 20000000) && (omsetTahunan === null || omsetTahunan <= 100000000);

    if (!namaPemilik || !namaUsaha || !lingkunganId) {
      return { success: false, error: "Nama pemilik, usaha, dan lingkungan wajib diisi" };
    }

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Akses ditolak: Lingkungan tujuan tidak sesuai." };
    }
    
    if (restriction.restricted) {
      const existing = await prisma.umkmData.findUnique({ where: { id: BigInt(id) } });
      if (existing && existing.lingkunganId !== restriction.lingkunganId) {
        return { success: false, error: "Akses ditolak: Anda tidak memiliki akses ke data ini." };
      }
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.umkmData.safeUpdate({
      where: { id: BigInt(id) },
      data: {
        namaPemilik,
        namaUsaha,
        jenisUsaha,
        asetTotal,
        omsetTahunan,
        nib,
        lingkunganId,
        nikEncrypted,
        kpsId: kpsIdBigInt,
        statusKelayakan: isLayak,
      }
    }, user.id);

    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui UMKM:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function deleteUmkmAction(id: string) {
  try {
    const restriction = await getLingkunganRestriction();
    if (restriction.restricted) {
      const existing = await prisma.umkmData.findUnique({ where: { id: BigInt(id) } });
      if (existing && existing.lingkunganId !== restriction.lingkunganId) {
        return { success: false, error: "Akses ditolak: Anda tidak memiliki akses ke data ini." };
      }
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.umkmData.softDelete({ id: BigInt(id) }, user.id);
    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus UMKM:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}

export async function getKpsByLingkungan(lingkunganId: number) {
  try {
    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return [];
    }

    const data = await prisma.kpsData.findMany({
      where: { lingkunganId },
      orderBy: { namaKepalaKeluarga: 'asc' },
    });
    
    return data.map(item => ({
      ...item,
      id: item.id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching KPS:", error);
    return [];
  }
}
