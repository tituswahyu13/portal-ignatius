import { db as prisma } from "@/lib/db";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        lingkungan: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Clean up BigInt serialization for JSON component passing
    return users.map((user) => ({
      ...user,
      id: user.id.toString(),
      userRoles: user.userRoles.map((ur) => ({
        ...ur,
        userId: ur.userId.toString(),
        role: ur.role,
      })),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data pengguna.");
  }
}

export async function getRoles() {
  try {
    return await prisma.role.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data roles.");
  }
}

export async function getLingkungan() {
  try {
    return await prisma.lingkungan.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data lingkungan.");
  }
}

export async function getPermissions() {
  try {
    return await prisma.permission.findMany({
      orderBy: [
        { appModule: 'asc' },
        { name: 'asc' }
      ]
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data permissions.");
  }
}

export async function getRolePermissions() {
  try {
    return await prisma.rolePermission.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Gagal mengambil data role_permissions.");
  }
}
