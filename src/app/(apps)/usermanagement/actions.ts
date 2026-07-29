"use server";

import { createClient } from "@supabase/supabase-js";
import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Kita menginisialisasi client Supabase khusus dengan SERVICE ROLE KEY
// Ini memungkinkan kita menggunakan API admin untuk membuat user tanpa perlu login/sesi.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function createUserAction(formData: any) {
  try {
    const { name, email, password, phoneNumber, roleId, lingkunganId } = formData;

    // 1. Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Otomatis terverifikasi
      user_metadata: { name },
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      return { success: false, error: authError.message };
    }

    // 2. Simpan profil user dan relasi ke Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber: phoneNumber || null,
        passwordHash: "$2b$10$dummyHashDikelolaOlehSupabase", 
        lingkunganId: lingkunganId ? parseInt(lingkunganId) : null,
        isActive: true,
        userRoles: {
          create: {
            roleId: parseInt(roleId),
          },
        },
      },
    });

    // Validasi ulang halaman agar tabel ter-refresh otomatis
    revalidatePath("/usermanagement");

    return { success: true, data: { id: newUser.id.toString(), email: newUser.email } };
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return { success: false, error: error.message || "Gagal mengubah profil pengguna" };
  }
}

export async function toggleUserActiveStatus(userId: string, isActive: boolean) {
  try {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { isActive },
    });

    // Also insert audit log if possible (AuditLog model was just added)
    // Note: in a real app you might want to know who did this, for now we leave userId as null (System)
    await prisma.auditLog.create({
      data: {
        action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entity: "User",
        entityId: userId,
        details: `User ${userId} status changed to ${isActive}`,
      }
    });

    revalidatePath("/usermanagement");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    return { success: false, error: error.message || "Gagal mengubah status pengguna" };
  }
}

export async function updateUserAction(id: string, formData: any) {
  try {
    const { name, phoneNumber, roleId, lingkunganId, isActive } = formData;
    
    // Update data profil dan hapus relasi role lama, ganti yang baru
    await prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        name,
        phoneNumber: phoneNumber || null,
        lingkunganId: lingkunganId ? parseInt(lingkunganId) : null,
        isActive: isActive !== undefined ? isActive : true,
        userRoles: {
          deleteMany: {},
          create: {
            roleId: parseInt(roleId),
          },
        },
      },
    });

    revalidatePath("/usermanagement");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return { success: false, error: error.message };
  }
}

export async function softDeleteUserAction(id: string, email: string) {
  try {
    // 1. Matikan status di Prisma
    await prisma.user.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });

    // 2. Cabut hak akses dari Supabase Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && usersData?.users) {
      const targetUser = usersData.users.find(u => u.email === email);
      if (targetUser) {
        // Hapus akun dari Auth supaya tidak bisa login lagi,
        // Tapi data di Prisma tetap utuh untuk historis dokumen
        await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
      }
    }

    revalidatePath("/usermanagement");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma/Supabase Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleRolePermissionAction(roleId: number, permissionId: number, isGranted: boolean) {
  try {
    if (isGranted) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId }
        },
        update: {},
        create: { roleId, permissionId }
      });
    } else {
      await prisma.rolePermission.deleteMany({
        where: { roleId, permissionId }
      });
    }

    revalidatePath("/usermanagement");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkUpdatePermissions(changes: { roleId: number, permissionId: number, isGranted: boolean }[]) {
  try {
    for (const change of changes) {
      if (change.isGranted) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: change.roleId, permissionId: change.permissionId }
          },
          update: {},
          create: { roleId: change.roleId, permissionId: change.permissionId }
        });
      } else {
        await prisma.rolePermission.deleteMany({
          where: { roleId: change.roleId, permissionId: change.permissionId }
        });
      }
      
      await prisma.auditLog.create({
        data: {
          action: change.isGranted ? "GRANT_PERMISSION" : "REVOKE_PERMISSION",
          entity: "RolePermission",
          entityId: `${change.roleId}-${change.permissionId}`,
          details: `Permission ${change.permissionId} ${change.isGranted ? 'granted to' : 'revoked from'} Role ${change.roleId}`
        }
      });
    }

    // Attempt to notify affected users (for now, just roles)
    // Find users who have the affected roles
    const affectedRoleIds = Array.from(new Set(changes.map(c => c.roleId)));
    const affectedUsers = await prisma.userRole.findMany({
      where: { roleId: { in: affectedRoleIds } }
    });

    const notifications = affectedUsers.map((ur: any) => ({
      userId: ur.userId,
      title: "Perubahan Hak Akses",
      message: `Hak akses untuk salah satu role Anda telah diperbarui oleh Administrator.`,
    }));

    if (notifications.length > 0) {
      // In a real app we might deduplicate this by userId
      await prisma.notification.createMany({
        data: notifications
      });
    }

    revalidatePath("/usermanagement");
    return { success: true };
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return { success: false, error: error.message };
  }
}

export async function resetUserPassword(email: string, newPassword: string) {
  try {
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError || !usersData?.users) {
      return { success: false, error: "Gagal memuat pengguna dari sistem autentikasi." };
    }
    
    const targetUser = usersData.users.find(u => u.email === email);
    if (!targetUser) {
      return { success: false, error: "Pengguna tidak ditemukan di sistem autentikasi." };
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      password: newPassword
    });

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return { success: false, error: updateError.message };
    }

    // Insert audit log
    const userInDb = await prisma.user.findUnique({ where: { email } });
    if (userInDb) {
      await prisma.auditLog.create({
        data: {
          action: "RESET_PASSWORD",
          entity: "User",
          entityId: userInDb.id.toString(),
          details: `Administrator mereset password untuk akun ${email}`,
        }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message };
  }
}
