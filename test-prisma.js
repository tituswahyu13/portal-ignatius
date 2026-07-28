const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { userRoles: true } });
  if (users.length === 0) return;
  const user = users[0];
  console.log("Found user", user.id.toString(), "with roles", user.userRoles);

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        userRoles: {
          deleteMany: {},
          create: {
            roleId: user.userRoles.length > 0 ? user.userRoles[0].roleId : 1
          }
        }
      }
    });
    console.log("Updated successfully", updated.id.toString());
  } catch (err) {
    console.error("Prisma Error during update:", err.message);
  }
}

main().finally(() => prisma.$disconnect());
