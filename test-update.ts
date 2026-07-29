import { db as prisma } from "./src/lib/db";

async function main() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });
    console.log(JSON.stringify(user, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    , 2));
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
