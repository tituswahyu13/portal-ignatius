"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadFileToDrive } from "@/lib/gdrive";

// Get data for form dropdowns
export async function getSpbFormData() {
  const [lingkungans, intensis] = await Promise.all([
    prisma.lingkungan.findMany({ orderBy: { namaLingkungan: 'asc' } }),
    prisma.intensiAccount.findMany({ orderBy: { id: 'asc' } })
  ]);
  
  return { lingkungans, intensis };
}

// Get Subjek (KPS/UMKM) by Lingkungan
export async function getSubjekByLingkungan(lingkunganId: number, type: "KPS" | "UMKM") {
  if (type === "KPS") {
    const kps = await prisma.kpsData.findMany({
      where: { lingkunganId },
      orderBy: { namaKepalaKeluarga: 'asc' }
    });
    return kps.map(k => ({ ...k, id: k.id.toString() }));
  } else {
    const umkm = await prisma.umkmData.findMany({
      where: { lingkunganId },
      orderBy: { namaPemilik: 'asc' }
    });
    return umkm.map(u => ({ ...u, id: u.id.toString() }));
  }
}

export async function createSpbAction(formData: FormData) {
  try {
    const lingkunganId = parseInt(formData.get("lingkunganId") as string);
    const intensiId = parseInt(formData.get("intensiId") as string);
    const subjekType = formData.get("subjekType") as "KPS" | "UMKM";
    const subjekId = formData.get("subjekId") as string;
    const kategoriBantuan = formData.get("kategoriBantuan") as string;
    const keaktifanUmat = formData.get("keaktifanUmat") as string;
    const alasanBantuan = formData.get("alasanBantuan") as string;
    
    const totalBiaya = parseFloat(formData.get("totalBiaya") as string || "0");
    const danaSwadaya = parseFloat(formData.get("danaSwadaya") as string || "0");
    const danaLingkungan = parseFloat(formData.get("danaLingkungan") as string || "0");
    
    // Auto calculate requested paroki funds
    const danaParokiRequested = totalBiaya - danaSwadaya - danaLingkungan;

    const file = formData.get("attachment") as File | null;

    if (!lingkunganId || !intensiId || !subjekId || !kategoriBantuan) {
      return { success: false, error: "Semua kolom utama wajib diisi" };
    }

    if (danaParokiRequested <= 0) {
      return { success: false, error: "Dana yang diajukan ke Paroki tidak valid (kurang dari atau sama dengan 0)" };
    }

    // --- UPLOAD KE GOOGLE DRIVE (Opsional) ---
    let googleDriveFileId = null;
    let fileType = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // Create unique filename
      const fileName = `SPB_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      googleDriveFileId = await uploadFileToDrive(buffer, fileName, file.type);
      fileType = file.type || "application/octet-stream";
    }
    
    // Generate nomor SPB prefix based on Kategori
    let prefix = "SPB";
    switch (kategoriBantuan) {
      case "Pangan": prefix = "PNG"; break;
      case "Sandang": prefix = "SND"; break;
      case "Papan (Bedah Rumah)": prefix = "PPN"; break;
      case "Kesehatan": prefix = "KSH"; break;
      case "Pendidikan": prefix = "PDD"; break;
      case "Pangruktilaya": prefix = "PRL"; break;
      case "Seminari": prefix = "SMN"; break;
      case "Bencana": prefix = "BNC"; break;
      case "Bantuan Modal Usaha": prefix = "BMU"; break;
    }

    const countSpb = await prisma.spbRequest.count({
      where: { kategoriBantuan } // optional: count per category for unique numbering per category
    });
    const currentYear = new Date().getFullYear();
    const nomorSpb = `${prefix}/${currentYear}/${(countSpb + 1).toString().padStart(4, '0')}`;

    // Get dummy admin ID for createdBy
    const admin = await prisma.user.findFirst({
      where: { email: "admin@portal-ignatius.local" }
    });

    if (!admin) {
      return { success: false, error: "User Admin (Dummy) belum dibuat. Jalankan seeder user terlebih dahulu." };
    }

    // Save SPB to Database with transaction
    await prisma.$transaction(async (tx) => {
      const spb = await tx.spbRequest.create({
        data: {
          nomorSpb,
          lingkunganId,
          intensiId,
          kpsId: subjekType === "KPS" ? BigInt(subjekId) : null,
          umkmId: subjekType === "UMKM" ? BigInt(subjekId) : null,
          kategoriBantuan,
          keaktifanUmat: keaktifanUmat || null,
          alasanBantuan: alasanBantuan || null,
          totalBiaya,
          danaSwadaya,
          danaLingkungan,
          danaParokiRequested,
          status: "SUBMITTED",
          createdBy: admin.id
        }
      });

      if (googleDriveFileId && fileType) {
        await tx.spbAttachment.create({
          data: {
            spbId: spb.id,
            fileType: fileType,
            googleDriveFileId: googleDriveFileId
          }
        });
      }
    });

    revalidatePath("/dansospar/spb");
    revalidatePath("/dansospar"); // Revalidate dashboard
    return { success: true };
  } catch (error: any) {
    console.error("Gagal membuat pengajuan SPB:", error);
    return { success: false, error: error.message || "Gagal membuat pengajuan SPB" };
  }
}

// Update SPB Status and Realize Funds
export async function updateSpbStatusAction(spbId: bigint, newStatus: string) {
  try {
    const spb = await prisma.spbRequest.findUnique({
      where: { id: spbId }
    });

    if (!spb) {
      return { success: false, error: "SPB tidak ditemukan" };
    }

    if (spb.status === "REALIZED") {
      return { success: false, error: "SPB sudah direalisasikan dan tidak dapat diubah" };
    }

    // Get dummy admin ID for createdBy
    const admin = await prisma.user.findFirst({
      where: { email: "admin@portal-ignatius.local" }
    });

    await prisma.$transaction(async (tx) => {
      await tx.spbRequest.update({
        where: { id: spbId },
        data: { status: newStatus as any }
      });

      // If realized, deduct funds from Intensi Account
      if (newStatus === "REALIZED") {
        const dana = spb.danaParokiRequested;
        
        // 1. Create Financial Mutation OUT
        await tx.financialMutation.create({
          data: {
            intensiId: spb.intensiId,
            type: "OUT",
            amount: dana,
            sourceType: "SPB_REALIZATION",
            referenceId: spb.nomorSpb,
            description: `Pencairan dana untuk ${spb.nomorSpb} - ${spb.kategoriBantuan}`,
            createdBy: admin ? admin.id : null
          }
        });

        // 2. Decrement Intensi Balance
        await tx.intensiAccount.update({
          where: { id: spb.intensiId },
          data: {
            saldo: { decrement: dana }
          }
        });
      }
    });

    revalidatePath("/dansospar/spb");
    revalidatePath("/dansospar/spb/[id]");
    revalidatePath("/dansospar/keuangan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal mengubah status SPB:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan data" };
  }
}
