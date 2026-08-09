"use server";

import { db as prisma } from "@/lib/db";
import { encryptString, decryptString } from "@/lib/encryption";
import { revalidatePath } from "next/cache";
import { getLingkunganRestriction, getCurrentUser } from "@/lib/auth/permissions";

export async function searchDataUmat(query: string, lingkunganId?: number) {
  try {
    const where: any = {};
    if (lingkunganId) where.lingkunganId = lingkunganId;
    if (query) {
      where.nama = { contains: query, mode: 'insensitive' };
    }
    
    // Hanya ambil 20 hasil teratas
    return await prisma.dataUmat.findMany({
      where,
      take: 20,
      select: {
        id: true,
        nama: true,
        alamat: true,
        tanggalLahir: true,
        noHp: true,
      }
    });
  } catch (error) {
    return [];
  }
}

export async function getUmatByLingkungan(lingkunganId: number) {
  try {
    const data = await prisma.dataUmat.findMany({
      where: { lingkunganId },
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nama: true,
      }
    });
    return data.map(d => ({ id: d.id.toString(), nama: d.nama }));
  } catch (error) {
    return [];
  }
}

export async function createKpsAction(formData: FormData) {
  try {
    const umatId = formData.get("umatId") as string;
    const nik = formData.get("nik") as string; // Optional (update ke DataUmat jika diisi)
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    
    if (!umatId || !lingkunganId) {
      return { success: false, error: "Pilihan Umat dan Lingkungan wajib diisi" };
    }

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Anda hanya dapat membuat data untuk lingkungan Anda sendiri." };
    }

    // Periksa duplikasi KPS
    const existingKps = await prisma.kpsData.findUnique({
      where: { umatId: BigInt(umatId) }
    });

    if (existingKps) {
      return { success: false, error: "Umat ini sudah terdaftar sebagai KPS." };
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

    // Jika ada input NIK baru, perbarui data umatnya
    if (nik && nik.length === 16) {
      const nikEncrypted = encryptString(nik);
      await prisma.dataUmat.update({
        where: { id: BigInt(umatId) },
        data: { nikEncrypted }
      });
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.kpsData.safeCreate({
      data: {
        umatId: BigInt(umatId),
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
      whereClause.umat = {
        OR: [
          { nama: { contains: searchQuery, mode: 'insensitive' } },
          { alamat: { contains: searchQuery, mode: 'insensitive' } }
        ]
      };
    }

    const rawData = await prisma.kpsData.findMany({
      where: whereClause,
      include: {
        umat: true,
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
        if (kps.umat?.nikEncrypted) {
          nik = decryptString(kps.umat.nikEncrypted);
          // Masking sebagian digit demi privasi tambahan di UI
          nik = nik.substring(0, 6) + "******" + nik.substring(12);
        } else {
          nik = "-";
        }
      } catch (e) { nik = "Error"; }
      
      try {
        if (kps.umat?.kkEncrypted) {
          kk = decryptString(kps.umat.kkEncrypted);
          kk = kk.substring(0, 6) + "******" + kk.substring(12);
        } else {
          kk = "-";
        }
      } catch (e) { kk = "Error"; }

      return {
        ...kps,
        id: kps.id ? kps.id.toString() : "",
        umatId: kps.umatId ? kps.umatId.toString() : "",
        createdBy: kps.createdBy ? kps.createdBy.toString() : null,
        updatedBy: kps.updatedBy ? kps.updatedBy.toString() : null,
        deletedBy: kps.deletedBy ? kps.deletedBy.toString() : null,
        umat: kps.umat ? {
          ...kps.umat,
          id: kps.umat.id ? kps.umat.id.toString() : ""
        } : null,
        persentaseKelayakan: kps.persentaseKelayakan ? kps.persentaseKelayakan.toString() : "0",
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
    const umatId = formData.get("umatId") as string;
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    
    if (!umatId || !lingkunganId) {
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

    // NIK (Only update if they exist and are not masked with '*')
    const nik = formData.get("nik") as string;
    
    if (nik && !nik.includes("*") && nik.length === 16) {
      const nikEncrypted = encryptString(nik);
      await prisma.dataUmat.update({
        where: { id: BigInt(umatId) },
        data: { nikEncrypted }
      });
    }

    const dataToUpdate: any = {
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

    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Update umat linked just in case it changed
    dataToUpdate.umatId = BigInt(umatId);

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
