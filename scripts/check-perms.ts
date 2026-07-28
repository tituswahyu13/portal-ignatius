import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { 
      userRoles: {
        some: {
          role: {
            name: "SUPER_ADMIN"
          }
        }
      }
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log("Super admin not found");
    return;
  }

  console.log("User:", user.email);
  for (const ur of user.userRoles) {
    console.log("Role:", ur.role.name);
    const perms = ur.role.rolePermissions.map(rp => rp.permission.name);
    console.log("Permissions count:", perms.length);
    console.log("Has UMKM_WRITE?", perms.includes("UMKM_WRITE"));
    console.log("Has UMKM_UPDATE?", perms.includes("UMKM_UPDATE"));
    console.log("Has UMKM_DELETE?", perms.includes("UMKM_DELETE"));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
