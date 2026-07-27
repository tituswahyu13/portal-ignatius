"use server";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/data/users";
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
    return { success: false, error: error.message || "Terjadi kesalahan internal" };
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
