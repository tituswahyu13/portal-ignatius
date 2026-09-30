import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db as prisma } from "@/lib/db";
import { cache } from "react";

// Cache this function so it only runs once per server request lifecycle
export const getCurrentUser = cache(async () => {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const isGuest = cookieStore.get("ignatius_guest_session")?.value === "true";

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser?.email) {
    if (isGuest) {
      return {
        id: "guest",
        name: "Tamu (Umat Paroki)",
        email: "tamu@portal-ignatius.id",
        phoneNumber: "-",
        isActive: true,
        lingkunganId: null,
        isGuest: true,
        userRoles: [
          {
            role: {
              name: "GUEST",
              description: "Tamu / Umat Umum (Read-Only Transparansi)",
              rolePermissions: [
                { permission: { name: "VIEW_DANSOSPAR_DASHBOARD", appModule: "DANSOSPAR" } },
                { permission: { name: "KPS_READ", appModule: "DANSOSPAR" } },
                { permission: { name: "LAPORAN_KEUANGAN_READ", appModule: "DANSOSPAR" } },
                { permission: { name: "UMKM_READ", appModule: "DANSOSPAR" } },
              ]
            }
          }
        ]
      } as any;
    }
    return null;
  }

  const userPromise = prisma.user.findUnique({
    where: { email: authUser.email },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.error("Prisma query timed out after 5 seconds");
      resolve(null);
    }, 5000);
  });

  const user = await Promise.race([userPromise, timeoutPromise]);

  return user;
});

export const hasPermission = async (permissionName: string) => {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return false;

  for (const userRole of user.userRoles) {
    for (const rp of userRole.role.rolePermissions) {
      if (rp.permission.name === permissionName) {
        return true;
      }
    }
  }
  return false;
};

export const hasModuleAccess = async (moduleName: string) => {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return false;

  for (const userRole of user.userRoles) {
    for (const rp of userRole.role.rolePermissions) {
      if (rp.permission.appModule === moduleName) {
        return true;
      }
    }
  }
  return false;
};

export const getLingkunganRestriction = async () => {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return { restricted: true, lingkunganId: -1 };

  if ((user as any).isGuest) {
    // Tamu dapat memantau data di seluruh lingkungan untuk transparansi
    return { restricted: false, lingkunganId: 0 };
  }

  // Roles that have global view access
  const globalRoles = ["SUPER_ADMIN", "Ketua PSE", "Ketua Dansospar", "Sekretaris Dansospar", "Bendahara Dansospar", "Pastor"];
  
  let isGlobal = false;
  for (const userRole of user.userRoles) {
    if (globalRoles.includes(userRole.role.name)) {
      isGlobal = true;
      break;
    }
  }

  if (isGlobal) {
    return { restricted: false, lingkunganId: 0 };
  } else {
    // Restricted to their own lingkungan
    return { restricted: true, lingkunganId: user.lingkunganId || -1 };
  }
};
