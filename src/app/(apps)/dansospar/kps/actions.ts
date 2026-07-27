"use server";

import { db as prisma } from "@/lib/db";
import { encryptString, decryptString } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

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

    // Encrypt sensitive data
    const nikEncrypted = encryptString(nik);
    const kkEncrypted = encryptString(kk);

    await prisma.kpsData.create({
      data: {
        namaKepalaKeluarga,
        nikEncrypted,
        kkEncrypted,
        alamat,
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
    });

    revalidatePath("/dansospar/kps");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan KPS:", error);
    return { success: false, error: error.message || "Terjadi kesalahan sistem" };
  }
}

export async function getKpsData() {
  try {
    const rawData = await prisma.kpsData.findMany({
      include: {
        lingkungan: true
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

    await prisma.kpsData.update({
      where: { id: BigInt(id) },
      data: {
        namaKepalaKeluarga,
        alamat,
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
    });

    revalidatePath("/dansospar/kps");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui KPS:", error);
    return { success: false, error: "Gagal memperbarui data" };
  }
}

export async function deleteKpsAction(id: string) {
  try {
    await prisma.kpsData.delete({
      where: { id: BigInt(id) }
    });
    revalidatePath("/dansospar/kps");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus KPS:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
