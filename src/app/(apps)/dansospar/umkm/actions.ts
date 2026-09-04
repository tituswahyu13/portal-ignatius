"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encryptString, decryptString } from "@/lib/encryption";
import { getLingkunganRestriction, getCurrentUser } from "@/lib/auth/permissions";
import { uploadFileToDrive } from "@/lib/gdrive";

export async function createUmkmAction(formData: FormData) {
  try {
    const umatId = formData.get("umatId") as string;
    const namaUsaha = formData.get("namaUsaha") as string;
    const jenisUsaha = formData.get("jenisUsaha") as string;
    const asetTotalStr = formData.get("asetTotal") as string;
    const asetTotal = asetTotalStr ? parseFloat(asetTotalStr) : null;
    
    const omsetTahunanStr = formData.get("omsetTahunan") as string;
    const omsetTahunan = omsetTahunanStr ? parseFloat(omsetTahunanStr) : null;
    
    const nib = formData.get("nib") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    const kpsId = formData.get("kpsId") as string;
    
    // New Fields
    const alamatUsaha = formData.get("alamatUsaha") as string || null;
    const kategoriUsaha = formData.get("kategoriUsaha") as string || null;
    const deskripsiUsaha = formData.get("deskripsiUsaha") as string || null;
    const keberadaanUsahaStr = formData.get("keberadaanUsaha") as string;
    const keberadaanUsaha = keberadaanUsahaStr === 'true' ? true : keberadaanUsahaStr === 'false' ? false : null;
    const kondisiUsahaSaatIni = formData.get("kondisiUsahaSaatIni") as string || null;
    const keahlian = formData.get("keahlian") as string || null;
    const pengalamanUsahaSebelumnya = formData.get("pengalamanUsahaSebelumnya") as string || null;
    const pelatihanKeuanganStr = formData.get("pelatihanKeuangan") as string;
    const pelatihanKeuangan = pelatihanKeuanganStr === 'true' ? true : pelatihanKeuanganStr === 'false' ? false : null;
    const anggotaPaguyubanStr = formData.get("anggotaPaguyuban") as string;
    const anggotaPaguyuban = anggotaPaguyubanStr === 'true' ? true : anggotaPaguyubanStr === 'false' ? false : null;
    const analisaUsaha = formData.get("analisaUsaha") as string || null;

    const kpsIdBigInt = kpsId ? BigInt(kpsId) : null;
    
    // Status kelayakan otomatis (Aset <= 20jt, Omset <= 100jt). Jika kosong, dianggap memenuhi syarat.
    const isLayak = (asetTotal === null || asetTotal <= 20000000) && (omsetTahunan === null || omsetTahunan <= 100000000);

    if (!umatId || !namaUsaha || !lingkunganId) {
      return { success: false, error: "Nama umat, usaha, dan lingkungan wajib diisi" };
    }

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Anda hanya dapat membuat data untuk lingkungan Anda sendiri." };
    }

    // Periksa duplikasi UMKM
    const existingUmkm = await prisma.umkmData.findFirst({
      where: {
        namaUsaha: { equals: namaUsaha, mode: 'insensitive' },
        umatId: BigInt(umatId),
        lingkunganId: lingkunganId
      }
    });

    if (existingUmkm) {
      return { success: false, error: "Data UMKM dengan nama usaha dan pemilik ini sudah terdaftar di lingkungan tersebut." };
    }

    if (nib && nib.trim() !== "") {
      const nibCount = await prisma.umkmData.count({
        where: { nib: nib.trim() }
      });
      
      if (nibCount >= 2) {
        return { success: false, error: `Pengajuan bantuan untuk NIB ${nib} sudah mencapai batas maksimal (2 kali).` };
      }
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // --- UPLOAD KE GOOGLE DRIVE (Opsional) ---
    let googleDriveFileId = null;
    const file = formData.get("lampiran") as File | null;
    if (file && file.size > 0 && file.name !== 'undefined') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `UMKM_${namaUsaha.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      googleDriveFileId = await uploadFileToDrive(buffer, fileName, file.type);
    }

    await prisma.umkmData.safeCreate({
      data: {
        umatId: BigInt(umatId),
        namaUsaha,
        jenisUsaha,
        asetTotal,
        omsetTahunan,
        nib,
        lingkunganId,
        kpsId: kpsIdBigInt,
        statusKelayakan: isLayak,
        googleDriveFileId,
        alamatUsaha,
        kategoriUsaha,
        deskripsiUsaha,
        keberadaanUsaha,
        kondisiUsahaSaatIni,
        keahlian,
        pengalamanUsahaSebelumnya,
        pelatihanKeuangan,
        anggotaPaguyuban,
        analisaUsaha,
      }
    }, user.id);

    revalidatePath("/dansospar/umkm");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan UMKM:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function getUmkmData(searchQuery?: string, lingkunganId?: string) {
  try {
    const restriction = await getLingkunganRestriction();
    const whereClause: any = {};
    
    if (restriction.restricted) {
      whereClause.lingkunganId = restriction.lingkunganId;
    } else if (lingkunganId && lingkunganId !== "ALL") {
      whereClause.lingkunganId = parseInt(lingkunganId);
    }

    if (searchQuery) {
      whereClause.OR = [
        { namaUsaha: { contains: searchQuery, mode: 'insensitive' } },
        { umat: { nama: { contains: searchQuery, mode: 'insensitive' } } }
      ];
    }

    const rawData = await prisma.umkmData.findMany({
      where: whereClause,
      include: {
        umat: true,
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
      id: umkm.id ? umkm.id.toString() : "",
      umatId: umkm.umatId ? umkm.umatId.toString() : "",
      createdBy: umkm.createdBy ? umkm.createdBy.toString() : null,
      updatedBy: umkm.updatedBy ? umkm.updatedBy.toString() : null,
      deletedBy: umkm.deletedBy ? umkm.deletedBy.toString() : null,
      umat: umkm.umat ? {
        ...umkm.umat,
        id: umkm.umat.id ? umkm.umat.id.toString() : ""
      } : null,
      kpsData: umkm.kpsData ? {
        ...umkm.kpsData,
        id: umkm.kpsData.id ? umkm.kpsData.id.toString() : "",
        umatId: umkm.kpsData.umatId ? umkm.kpsData.umatId.toString() : "",
        createdBy: umkm.kpsData.createdBy ? umkm.kpsData.createdBy.toString() : null,
        updatedBy: umkm.kpsData.updatedBy ? umkm.kpsData.updatedBy.toString() : null,
        deletedBy: umkm.kpsData.deletedBy ? umkm.kpsData.deletedBy.toString() : null,
        persentaseKelayakan: umkm.kpsData.persentaseKelayakan ? umkm.kpsData.persentaseKelayakan.toString() : "0"
      } : null,
      asetTotal: umkm.asetTotal ? umkm.asetTotal.toString() : "0",
      omsetTahunan: umkm.omsetTahunan ? umkm.omsetTahunan.toString() : "0",
      kpsId: umkm.kpsId ? umkm.kpsId.toString() : null,
      googleDriveFileId: umkm.googleDriveFileId,
    }));
  } catch (error) {
    console.error("Gagal mengambil data UMKM:", error);
    return [];
  }
}

export async function updateUmkmAction(id: string, formData: FormData) {
  try {
    const umatId = formData.get("umatId") as string;
    const namaUsaha = formData.get("namaUsaha") as string;
    const jenisUsaha = formData.get("jenisUsaha") as string;
    const asetTotalStr = formData.get("asetTotal") as string;
    const asetTotal = asetTotalStr ? parseFloat(asetTotalStr) : null;
    
    const omsetTahunanStr = formData.get("omsetTahunan") as string;
    const omsetTahunan = omsetTahunanStr ? parseFloat(omsetTahunanStr) : null;
    
    const nib = formData.get("nib") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    const kpsId = formData.get("kpsId") as string;
    
    // New Fields
    const alamatUsaha = formData.get("alamatUsaha") as string || null;
    const kategoriUsaha = formData.get("kategoriUsaha") as string || null;
    const deskripsiUsaha = formData.get("deskripsiUsaha") as string || null;
    const keberadaanUsahaStr = formData.get("keberadaanUsaha") as string;
    const keberadaanUsaha = keberadaanUsahaStr === 'true' ? true : keberadaanUsahaStr === 'false' ? false : null;
    const kondisiUsahaSaatIni = formData.get("kondisiUsahaSaatIni") as string || null;
    const keahlian = formData.get("keahlian") as string || null;
    const pengalamanUsahaSebelumnya = formData.get("pengalamanUsahaSebelumnya") as string || null;
    const pelatihanKeuanganStr = formData.get("pelatihanKeuangan") as string;
    const pelatihanKeuangan = pelatihanKeuanganStr === 'true' ? true : pelatihanKeuanganStr === 'false' ? false : null;
    const anggotaPaguyubanStr = formData.get("anggotaPaguyuban") as string;
    const anggotaPaguyuban = anggotaPaguyubanStr === 'true' ? true : anggotaPaguyubanStr === 'false' ? false : null;
    const analisaUsaha = formData.get("analisaUsaha") as string || null;

    const kpsIdBigInt = kpsId ? BigInt(kpsId) : null;
    
    // Status kelayakan otomatis (Aset <= 20jt, Omset <= 100jt). Jika kosong, dianggap memenuhi syarat.
    const isLayak = (asetTotal === null || asetTotal <= 20000000) && (omsetTahunan === null || omsetTahunan <= 100000000);

    if (!umatId || !namaUsaha || !lingkunganId) {
      return { success: false, error: "Nama umat, usaha, dan lingkungan wajib diisi" };
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

    // Periksa duplikasi UMKM (abaikan id UMKM ini sendiri)
    const existingUmkm = await prisma.umkmData.findFirst({
      where: {
        namaUsaha: { equals: namaUsaha, mode: 'insensitive' },
        umatId: BigInt(umatId),
        lingkunganId: lingkunganId,
        id: { not: BigInt(id) }
      }
    });

    if (existingUmkm) {
      return { success: false, error: "Data UMKM dengan nama usaha dan pemilik ini sudah terdaftar di lingkungan tersebut pada entri lain." };
    }

    if (nib && nib.trim() !== "") {
      const nibCount = await prisma.umkmData.count({
        where: { 
          nib: nib.trim(),
          id: { not: BigInt(id) } 
        }
      });
      
      if (nibCount >= 2) {
        return { success: false, error: `Pengajuan bantuan untuk NIB ${nib} sudah mencapai batas maksimal (2 kali).` };
      }
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let googleDriveFileId: string | null | undefined = undefined;
    const file = formData.get("lampiran") as File | null;
    if (file && file.size > 0 && file.name !== 'undefined') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `UMKM_${namaUsaha.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      googleDriveFileId = await uploadFileToDrive(buffer, fileName, file.type);
    }

    const dataToUpdate: any = {
      umatId: BigInt(umatId),
      namaUsaha,
      jenisUsaha,
      asetTotal,
      omsetTahunan,
      nib,
      lingkunganId,
      kpsId: kpsIdBigInt,
      statusKelayakan: isLayak,
      alamatUsaha,
      kategoriUsaha,
      deskripsiUsaha,
      keberadaanUsaha,
      kondisiUsahaSaatIni,
      keahlian,
      pengalamanUsahaSebelumnya,
      pelatihanKeuangan,
      anggotaPaguyuban,
      analisaUsaha,
    };
    
    if (googleDriveFileId) {
      dataToUpdate.googleDriveFileId = googleDriveFileId;
    }

    await prisma.umkmData.safeUpdate({
      where: { id: BigInt(id) },
      data: dataToUpdate
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
      include: { umat: true }
    });
    
    return data.map(item => ({
      ...item,
      id: item.id.toString(),
      umatId: item.umatId.toString(),
      namaKepalaKeluarga: item.umat?.nama || "Tidak diketahui"
    })).sort((a, b) => a.namaKepalaKeluarga.localeCompare(b.namaKepalaKeluarga));
  } catch (error) {
    console.error("Error fetching KPS:", error);
    return [];
  }
}
