"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encryptString, decryptString } from "@/lib/encryption";
import { getLingkunganRestriction } from "@/lib/auth/permissions";

export async function getSemuaDataUmat() {
  try {
    const restriction = await getLingkunganRestriction();
    const whereClause: any = restriction.restricted
      ? { lingkunganId: restriction.lingkunganId }
      : {};

    const data = await prisma.dataUmat.findMany({
      where: whereClause,
      include: {
        lingkungan: true
      },
      orderBy: { nama: 'asc' }
    });

    return data.map(d => {
      let nikMasked = "";
      let kkMasked = "";
      let kkDecrypted = "";

      if (d.nikEncrypted) {
        try {
          const decrypted = decryptString(d.nikEncrypted);
          if (decrypted && !decrypted.includes("FAILED")) {
            nikMasked = decrypted.substring(0, 6) + "******" + decrypted.substring(12);
          }
        } catch(e) {}
      }

      if (d.kkEncrypted) {
        try {
          const decrypted = decryptString(d.kkEncrypted);
          if (decrypted && !decrypted.includes("FAILED")) {
            kkMasked = decrypted.substring(0, 6) + "******" + decrypted.substring(12);
            kkDecrypted = decrypted;
          }
        } catch(e) {}
      }

      return {
        ...d,
        id: d.id.toString(),
        lingkunganId: d.lingkunganId,
        namaLingkungan: d.lingkungan?.namaLingkungan || "-",
        nikMasked,
        kkMasked,
        kkDecrypted
      };
    });
  } catch (error) {
    console.error("Error fetching data umat:", error);
    return [];
  }
}

export async function createDataUmat(formData: FormData) {
  try {
    const nama = formData.get("nama") as string;
    const lingkunganIdStr = formData.get("lingkunganId") as string;
    const nik = formData.get("nik") as string;
    const kk = formData.get("kk") as string;

    if (!nama || !lingkunganIdStr || !nik || !kk) {
      return { success: false, message: "Nama, Lingkungan, NIK, dan No KK wajib diisi." };
    }

    const restriction = await getLingkunganRestriction();
    const lingkunganId = parseInt(lingkunganIdStr);

    if (restriction.restricted && lingkunganId !== restriction.lingkunganId) {
      return { success: false, message: "Anda hanya dapat menambahkan umat di lingkungan Anda." };
    }

    const nikEncrypted = encryptString(nik);
    const kkEncrypted = encryptString(kk);

    // Parse optional fields
    const tanggalLahirStr = formData.get("tanggalLahir") as string;
    let tanggalLahir: Date | null = null;
    if (tanggalLahirStr) {
      tanggalLahir = new Date(tanggalLahirStr);
    }

    await prisma.dataUmat.create({
      data: {
        nama,
        namaBaptis: formData.get("namaBaptis") as string || null,
        jenisKelamin: formData.get("jenisKelamin") as string || null,
        kkEncrypted,
        nikEncrypted,
        noHp: formData.get("noHp") as string || null,
        tanggalLahir,
        lingkunganId,
        alamat: formData.get("alamat") as string || null,
        agama: formData.get("agama") as string || null,
        statusNikah: formData.get("statusNikah") as string || null,
        pendidikan: formData.get("pendidikan") as string || null,
        pekerjaan: formData.get("pekerjaan") as string || null,
        profesi: formData.get("profesi") as string || null,
        kondisiTubuh: formData.get("kondisiTubuh") as string || null,
        statusRumah: formData.get("statusRumah") as string || null,
        suku: formData.get("suku") as string || null,
        statusAktivitas: formData.get("statusAktivitas") as string || null,
        kota: formData.get("kota") as string || null,
        kecamatan: formData.get("kecamatan") as string || null,
        kelurahan: formData.get("kelurahan") as string || null,
      }
    });

    revalidatePath("/dataumat");
    return { success: true };
  } catch (error) {
    console.error("Error creating data umat:", error);
    return { success: false, message: "Gagal membuat data umat" };
  }
}

export async function updateDataUmat(id: string, formData: FormData) {
  try {
    const umat = await prisma.dataUmat.findUnique({ where: { id: BigInt(id) } });
    if (!umat) return { success: false, message: "Data tidak ditemukan." };

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && umat.lingkunganId !== restriction.lingkunganId) {
      return { success: false, message: "Anda tidak memiliki akses untuk mengubah data umat di lingkungan ini." };
    }

    const nama = formData.get("nama") as string;
    const lingkunganIdStr = formData.get("lingkunganId") as string;
    const nik = formData.get("nik") as string;
    const kk = formData.get("kk") as string;

    if (!nama || !lingkunganIdStr || !nik || !kk) {
      return { success: false, message: "Nama, Lingkungan, NIK, dan No KK wajib diisi." };
    }

    const lingkunganId = parseInt(lingkunganIdStr);
    if (restriction.restricted && lingkunganId !== restriction.lingkunganId) {
      return { success: false, message: "Anda tidak dapat memindahkan umat ke lingkungan lain." };
    }

    let nikEncrypted = umat.nikEncrypted;
    // Check if NIK is not masked, meaning it was edited
    if (nik && !nik.includes("*")) {
      nikEncrypted = encryptString(nik);
    }

    let kkEncrypted = umat.kkEncrypted;
    // Check if KK is not masked
    if (kk && !kk.includes("*")) {
      kkEncrypted = encryptString(kk);
    }

    // Parse optional fields
    const tanggalLahirStr = formData.get("tanggalLahir") as string;
    let tanggalLahir: Date | null = null;
    if (tanggalLahirStr) {
      tanggalLahir = new Date(tanggalLahirStr);
    }

    await prisma.dataUmat.update({
      where: { id: BigInt(id) },
      data: {
        nama,
        namaBaptis: formData.get("namaBaptis") as string || null,
        jenisKelamin: formData.get("jenisKelamin") as string || null,
        kkEncrypted,
        nikEncrypted,
        noHp: formData.get("noHp") as string || null,
        tanggalLahir,
        lingkunganId,
        alamat: formData.get("alamat") as string || null,
        agama: formData.get("agama") as string || null,
        statusNikah: formData.get("statusNikah") as string || null,
        pendidikan: formData.get("pendidikan") as string || null,
        pekerjaan: formData.get("pekerjaan") as string || null,
        profesi: formData.get("profesi") as string || null,
        kondisiTubuh: formData.get("kondisiTubuh") as string || null,
        statusRumah: formData.get("statusRumah") as string || null,
        suku: formData.get("suku") as string || null,
        statusAktivitas: formData.get("statusAktivitas") as string || null,
        kota: formData.get("kota") as string || null,
        kecamatan: formData.get("kecamatan") as string || null,
        kelurahan: formData.get("kelurahan") as string || null,
      }
    });

    revalidatePath("/dataumat");
    return { success: true };
  } catch (error) {
    console.error("Error updating data umat:", error);
    return { success: false, message: "Gagal mengupdate data umat" };
  }
}

export async function deleteDataUmat(id: string) {
  try {
    const umat = await prisma.dataUmat.findUnique({ where: { id: BigInt(id) } });
    if (!umat) return { success: false, message: "Data tidak ditemukan." };

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && umat.lingkunganId !== restriction.lingkunganId) {
      return { success: false, message: "Anda tidak memiliki akses untuk menghapus data umat ini." };
    }

    // Check relations
    const checkKps = await prisma.kpsData.count({ where: { umatId: BigInt(id) } });
    const checkUmkm = await prisma.umkmData.count({ where: { umatId: BigInt(id) } });
    
    if (checkKps > 0 || checkUmkm > 0) {
      return { success: false, message: "Data umat tidak bisa dihapus karena masih terkait dengan KPS atau UMKM" };
    }

    await prisma.dataUmat.delete({
      where: { id: BigInt(id) }
    });

    revalidatePath("/dataumat");
    return { success: true };
  } catch (error) {
    console.error("Error deleting data umat:", error);
    return { success: false, message: "Gagal menghapus data umat" };
  }
}
