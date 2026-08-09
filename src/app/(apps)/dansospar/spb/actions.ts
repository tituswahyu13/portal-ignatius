"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadFileToDrive } from "@/lib/gdrive";
import { getLingkunganRestriction, hasPermission, getCurrentUser } from "@/lib/auth/permissions";

// Get data for form dropdowns
export async function getSpbFormData() {
  const restriction = await getLingkunganRestriction();
  const lingkunganWhere = restriction.restricted 
    ? { id: restriction.lingkunganId }
    : {};

  const [lingkungans, intensis] = await Promise.all([
    prisma.lingkungan.findMany({ where: lingkunganWhere, orderBy: { namaLingkungan: 'asc' } }),
    prisma.intensiAccount.findMany({ orderBy: { id: 'asc' } })
  ]);
  
  return { lingkungans, intensis };
}

// Get Subjek (KPS/UMKM) by Lingkungan
export async function getSubjekByLingkungan(lingkunganId: number, type: "KPS" | "UMKM") {
  const restriction = await getLingkunganRestriction();
  if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
    return [];
  }

  if (type === "KPS") {
    const kps = await prisma.kpsData.findMany({
      where: { lingkunganId },
      include: { umat: true },
      orderBy: { umat: { nama: 'asc' } }
    });
    return kps.map(k => ({ ...k, id: k.id.toString(), namaKepalaKeluarga: k.umat?.nama || "Tidak diketahui" }));
  } else {
    const umkm = await prisma.umkmData.findMany({
      where: { lingkunganId },
      include: { umat: true },
      orderBy: { umat: { nama: 'asc' } }
    });
    return umkm.map(u => ({ ...u, id: u.id.toString(), namaPemilik: u.umat?.nama || "Tidak diketahui" }));
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

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== lingkunganId) {
      return { success: false, error: "Akses ditolak: Anda hanya dapat membuat SPB untuk Lingkungan Anda sendiri." };
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

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Sesi tidak valid. Harap login kembali." };
    }

    // Save SPB to Database with transaction
    await prisma.$transaction(async (tx) => {
      const spb = await tx.spbRequest.safeCreate({
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
          status: "SUBMITTED"
          // createdBy is handled by safeCreate
        }
      }, currentUser.id);

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
export async function updateSpbStatusAction(
  spbId: bigint, 
  newStatus: string, 
  payload?: { danaApproved?: number, rekomendasi?: boolean, rejectionReason?: string }
) {
  try {
    const spb = await prisma.spbRequest.findUnique({
      where: { id: spbId }
    });

    if (!spb) {
      return { success: false, error: "SPB tidak ditemukan" };
    }

    // Restriction check: SPB realization or status update
    // If restricted, they can't update status of other lingkungan's SPB, 
    // BUT typically restricted users shouldn't be updating status (approval) anyway! 
    // So this is a defense-in-depth measure.
    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && spb.lingkunganId !== restriction.lingkunganId) {
      return { success: false, error: "Akses ditolak: SPB ini bukan milik Lingkungan Anda." };
    }

    // Role Permission Check
    let allowed = false;
    if (newStatus === "REJECTED") {
       // Anyone in the approval chain can reject if it's currently at their stage, simplified:
       allowed = true; // Ideally we should check if they can approve the CURRENT stage
    } else if (newStatus === "REVIEW_PIC" && await hasPermission("REVIEW_SPB_PIC")) allowed = true;
    else if (newStatus === "APPROVED_TPDSP" && await hasPermission("APPROVE_SPB_TPDSP")) allowed = true;
    else if (newStatus === "APPROVED_PASTOR" && await hasPermission("APPROVE_SPB_PASTOR")) allowed = true;
    else if (newStatus === "REALIZED" && await hasPermission("REALIZE_SPB")) allowed = true;
    
    if (!allowed && newStatus !== "REJECTED") {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki wewenang untuk tindakan ini." };
    }

    if (spb.status === "REALIZED") {
      return { success: false, error: "SPB sudah direalisasikan dan tidak dapat diubah" };
    }

    const currentUser = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      const updateData: any = { status: newStatus as any };
      
      if (newStatus === "APPROVED_TPDSP" && payload?.danaApproved !== undefined) {
        updateData.danaParokiApproved = payload.danaApproved;
        updateData.rekomendasiKevikepan = payload.rekomendasi || false;
      }
      
      if (newStatus === "REJECTED" && payload?.rejectionReason) {
        updateData.rejectionReason = payload.rejectionReason;
      }

      await tx.spbRequest.safeUpdate({
        where: { id: spbId },
        data: updateData
      }, currentUser ? currentUser.id : BigInt(0));

      // If realized, deduct funds from Intensi Account
      if (newStatus === "REALIZED") {
        const dana = spb.danaParokiApproved !== null ? spb.danaParokiApproved : spb.danaParokiRequested;
        
        // 1. Create Financial Mutation OUT
        await tx.financialMutation.safeCreate({
          data: {
            intensiId: spb.intensiId,
            type: "OUT",
            amount: dana,
            sourceType: "SPB_REALIZATION",
            referenceId: spb.nomorSpb,
            description: `Pencairan dana untuk ${spb.nomorSpb} - ${spb.kategoriBantuan}`
            // createdBy is handled by safeCreate
          }
        }, currentUser ? currentUser.id : BigInt(0));

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

// Edit SPB
export async function editSpbAction(spbId: bigint, formData: FormData) {
  try {
    const spb = await prisma.spbRequest.findUnique({ where: { id: spbId } });
    if (!spb) return { success: false, error: "SPB tidak ditemukan" };
    if (spb.status !== "SUBMITTED") return { success: false, error: "Hanya SPB yang masih dalam status Diajukan yang dapat diubah" };

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== spb.lingkunganId) {
      return { success: false, error: "Akses ditolak" };
    }

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
    const danaParokiRequested = totalBiaya - danaSwadaya - danaLingkungan;

    if (!lingkunganId || !intensiId || !subjekId || !kategoriBantuan) {
      return { success: false, error: "Semua kolom utama wajib diisi" };
    }

    if (danaParokiRequested <= 0) {
      return { success: false, error: "Dana yang diajukan ke Paroki tidak valid (kurang dari atau sama dengan 0)" };
    }

    const file = formData.get("attachment") as File | null;
    let googleDriveFileId = null;
    let fileType = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `SPB_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      googleDriveFileId = await uploadFileToDrive(buffer, fileName, file.type);
      fileType = file.type || "application/octet-stream";
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Unauthorized" };

    await prisma.$transaction(async (tx) => {
      await tx.spbRequest.safeUpdate({
        where: { id: spbId },
        data: {
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
        }
      }, currentUser.id);

      if (googleDriveFileId && fileType) {
        await tx.spbAttachment.create({
          data: {
            spbId: spbId,
            fileType: fileType,
            googleDriveFileId: googleDriveFileId
          }
        });
      }
    });

    revalidatePath("/dansospar/spb");
    revalidatePath(`/dansospar/spb/${spbId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Gagal mengubah SPB:", error);
    return { success: false, error: error.message || "Gagal mengubah SPB" };
  }
}

// Delete SPB
export async function deleteSpbAction(spbId: bigint) {
  try {
    const spb = await prisma.spbRequest.findUnique({ where: { id: spbId } });
    if (!spb) return { success: false, error: "SPB tidak ditemukan" };
    if (spb.status !== "SUBMITTED") return { success: false, error: "Hanya SPB yang masih dalam status Diajukan yang dapat dihapus" };

    const restriction = await getLingkunganRestriction();
    if (restriction.restricted && restriction.lingkunganId !== spb.lingkunganId) {
      return { success: false, error: "Akses ditolak" };
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Unauthorized" };

    await prisma.spbRequest.softDelete({ id: spbId }, currentUser.id);

    revalidatePath("/dansospar/spb");
    revalidatePath("/dansospar");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus SPB:", error);
    return { success: false, error: error.message || "Gagal menghapus SPB" };
  }
}
