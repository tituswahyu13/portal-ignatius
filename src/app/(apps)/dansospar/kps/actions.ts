"use server";

import { db as prisma } from "@/lib/db";
import { encryptString, decryptString } from "@/lib/encryption";
import { revalidatePath } from "next/cache";
import { getLingkunganRestriction, getCurrentUser } from "@/lib/auth/permissions";

export async function createKpsAction(formData: FormData) {
  try {
    const namaKepalaKeluarga = formData.get("namaKepalaKeluarga") as string;
    const nik = formData.get("nik") as string;
    const kk = formData.get("kk") as string;
    const alamat = formData.get("alamat") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    
    if (!namaKepalaKeluarga || !nik || !kk || !alamat || !lingkunganId) {
      return { success: false, error: "Semua kolom wajib diisi" };
    }

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Anda hanya dapat membuat data untuk lingkungan Anda sendiri." };
    }

    // Periksa duplikasi NIK
    const allKps = await prisma.kpsData.findMany({ select: { id: true, nikEncrypted: true } });
    const isDuplicate = allKps.some(kps => {
      try {
        return decryptString(kps.nikEncrypted) === nik;
      } catch (e) {
        return false;
      }
    });

    if (isDuplicate) {
      return { success: false, error: "Data KPS dengan NIK ini sudah terdaftar." };
    }

    // Ambil nilai skor (0 berarti N/A atau tidak dinilai)
    const skorPekerjaan = parseInt(formData.get("skorPekerjaan") as string || "0");
    const skorSandang = parseInt(formData.get("skorSandang") as string || "0");
    const skorPangan = parseInt(formData.get("skorPangan") as string || "0");
    const skorPapan = parseInt(formData.get("skorPapan") as string || "0");
    const skorKesehatan = parseInt(formData.get("skorKesehatan") as string || "0");
    const skorPendidikan = parseInt(formData.get("skorPendidikan") as string || "0");
    const skorSosial = parseInt(formData.get("skorSosial") as string || "0");

    const allScores = [
      skorPekerjaan, skorSandang, skorPangan, skorPapan, 
      skorKesehatan, skorPendidikan, skorSosial
    ];

    // Hitung jumlah indikator yang aktif (skor > 0)
    const indikatorAktif = allScores.filter(s => s > 0).length;
    
    // Total skor yang diperoleh
    const totalSkor = allScores.reduce((a, b) => a + b, 0);

    // Kalkulasi persentase
    let persentaseKelayakan = 0;
    if (indikatorAktif > 0) {
      persentaseKelayakan = (totalSkor / (indikatorAktif * 3)) * 100;
    }

    // Tentukan status KPS
    const statusKeluarga = persentaseKelayakan < 66 ? "Prasejahtera" : "Sejahtera";

    // New optional fields
    const noHp = formData.get("noHp") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const tanggalLahirStr = formData.get("tanggalLahir") as string;
    const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;

    // Encrypt sensitive data
    const nikEncrypted = encryptString(nik);
    const kkEncrypted = encryptString(kk);

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.kpsData.safeCreate({
      data: {
        namaKepalaKeluarga,
        nikEncrypted,
        kkEncrypted,
        alamat,
        noHp: noHp || null,
        pekerjaan: pekerjaan || null,
        tanggalLahir,
        lingkunganId,
        skorPekerjaan,
        skorSandang,
        skorPangan,
        skorPapan,
        skorKesehatan,
        skorPendidikan,
        skorSosial,
        totalSkor,
        persentaseKelayakan,
        statusKeluarga
      }
    }, user.id);

    revalidatePath("/dansospar/kps");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan KPS:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function getKpsData(searchQuery?: string, lingkunganId?: string) {
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
        { namaKepalaKeluarga: { contains: searchQuery, mode: 'insensitive' } },
        { alamat: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    const rawData = await prisma.kpsData.findMany({
      where: whereClause,
      include: {
        lingkungan: true,
        creator: { select: { name: true } },
        updater: { select: { name: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Dekripsi NIK & KK untuk ditampilkan ke UI
    return rawData.map(kps => {
      let nik = "";
      let kk = "";
      
      try {
        nik = decryptString(kps.nikEncrypted);
        // Masking sebagian digit demi privasi tambahan di UI
        nik = nik.substring(0, 6) + "******" + nik.substring(12);
      } catch (e) { nik = "Error"; }
      
      try {
        kk = decryptString(kps.kkEncrypted);
        kk = kk.substring(0, 6) + "******" + kk.substring(12);
      } catch (e) { kk = "Error"; }

      return {
        ...kps,
        id: kps.id.toString(), // Convert BigInt
        persentaseKelayakan: kps.persentaseKelayakan ? kps.persentaseKelayakan.toString() : "0", // Convert Decimal
        nikDecryptedMasked: nik,
        kkDecryptedMasked: kk
      };
    });
  } catch (error) {
    console.error("Gagal mengambil data KPS:", error);
    return [];
  }
}

export async function updateKpsAction(id: string, formData: FormData) {
  try {
    const namaKepalaKeluarga = formData.get("namaKepalaKeluarga") as string;
    const alamat = formData.get("alamat") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    
    if (!namaKepalaKeluarga || !alamat || !lingkunganId) {
      return { success: false, error: "Kolom wajib harus diisi" };
    }

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Akses ditolak: Lingkungan tujuan tidak sesuai." };
    }
    
    if (restriction.restricted) {
      const existing = await prisma.kpsData.findUnique({ where: { id: BigInt(id) } });
      if (existing && existing.lingkunganId !== restriction.lingkunganId) {
        return { success: false, error: "Akses ditolak: Anda tidak memiliki akses ke data ini." };
      }
    }

    const skorPekerjaan = parseInt(formData.get("skorPekerjaan") as string || "0");
    const skorSandang = parseInt(formData.get("skorSandang") as string || "0");
    const skorPangan = parseInt(formData.get("skorPangan") as string || "0");
    const skorPapan = parseInt(formData.get("skorPapan") as string || "0");
    const skorKesehatan = parseInt(formData.get("skorKesehatan") as string || "0");
    const skorPendidikan = parseInt(formData.get("skorPendidikan") as string || "0");
    const skorSosial = parseInt(formData.get("skorSosial") as string || "0");

    const allScores = [
      skorPekerjaan, skorSandang, skorPangan, skorPapan, 
      skorKesehatan, skorPendidikan, skorSosial
    ];

    const indikatorAktif = allScores.filter(s => s > 0).length;
    const totalSkor = allScores.reduce((a, b) => a + b, 0);

    let persentaseKelayakan = 0;
    if (indikatorAktif > 0) {
      persentaseKelayakan = (totalSkor / (indikatorAktif * 3)) * 100;
    }

    const statusKeluarga = persentaseKelayakan < 66 ? "Prasejahtera" : "Sejahtera";

    // New optional fields
    const noHp = formData.get("noHp") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const tanggalLahirStr = formData.get("tanggalLahir") as string;
    const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;
    
    // NIK & KK (Only update if they exist and are not masked with '*')
    const nik = formData.get("nik") as string;
    const kk = formData.get("kk") as string;
    
    let nikEncryptedToSave: string | undefined;
    if (nik && !nik.includes("*") && nik.length === 16) {
      // Periksa duplikasi NIK (abaikan id KPS ini sendiri)
      const allKps = await prisma.kpsData.findMany({ select: { id: true, nikEncrypted: true } });
      const isDuplicate = allKps.some(kps => {
        if (kps.id.toString() === id) return false;
        try {
          return decryptString(kps.nikEncrypted) === nik;
        } catch (e) {
          return false;
        }
      });

      if (isDuplicate) {
        return { success: false, error: "Data KPS dengan NIK ini sudah terdaftar pada keluarga lain." };
      }

      nikEncryptedToSave = encryptString(nik);
    }
    
    let kkEncryptedToSave: string | undefined;
    if (kk && !kk.includes("*") && kk.length === 16) {
      kkEncryptedToSave = encryptString(kk);
    }

    const dataToUpdate: any = {
      namaKepalaKeluarga,
      alamat,
      noHp: noHp || null,
      pekerjaan: pekerjaan || null,
      tanggalLahir,
      lingkunganId,
      skorPekerjaan,
      skorSandang,
      skorPangan,
      skorPapan,
      skorKesehatan,
      skorPendidikan,
      skorSosial,
      totalSkor,
      persentaseKelayakan,
      statusKeluarga
    };
    
    if (nikEncryptedToSave) dataToUpdate.nikEncrypted = nikEncryptedToSave;
    if (kkEncryptedToSave) dataToUpdate.kkEncrypted = kkEncryptedToSave;

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.kpsData.safeUpdate({
      where: { id: BigInt(id) },
      data: dataToUpdate
    }, user.id);

    revalidatePath("/dansospar/kps");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui KPS:", error);
    return { success: false, error: error.message || "Gagal memperbarui data" };
  }
}

export async function deleteKpsAction(id: string) {
  try {
    const restriction = await getLingkunganRestriction();
    if (restriction.restricted) {
      const existing = await prisma.kpsData.findUnique({ where: { id: BigInt(id) } });
      if (existing && existing.lingkunganId !== restriction.lingkunganId) {
        return { success: false, error: "Akses ditolak: Anda tidak memiliki akses ke data ini." };
      }
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.kpsData.softDelete({ id: BigInt(id) }, user.id);
    revalidatePath("/dansospar/kps");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus KPS:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
