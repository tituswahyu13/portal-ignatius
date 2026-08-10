import { PrismaClient } from '@prisma/client';
import { decryptString } from './src/lib/encryption';

const prisma = new PrismaClient();

async function main() {
  try {
    const data = await prisma.dataUmat.findMany({
      where: { lingkunganId: 1 },
      orderBy: { nama: 'asc' },
      take: 5,
      select: {
        id: true,
        nama: true,
        pekerjaan: true,
        profesi: true,
        nikEncrypted: true
      }
    });

    const mappedData = data.map(d => {
      let nikMasked = "";
      if (d.nikEncrypted) {
        try {
          const decrypted = decryptString(d.nikEncrypted);
          if (decrypted && !decrypted.includes("FAILED")) {
            nikMasked = decrypted.substring(0, 6) + "******" + decrypted.substring(12);
          }
        } catch(e) {}
      }
      return { 
        id: d.id.toString(), 
        nama: d.nama,
        pekerjaan: d.pekerjaan || "",
        profesi: d.profesi || "",
        nikMasked
      };
    });

    console.log("Result:", mappedData);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
