// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai kalkulasi ulang persentase KPS...");

  const kpsData = await prisma.kpsData.findMany();
  console.log(`Ditemukan ${kpsData.length} data KPS.`);

  const weights = {
    skorPekerjaan: 25,
    skorPangan: 20,
    skorPapan: 15,
    skorKesehatan: 15,
    skorSandang: 10,
    skorPendidikan: 10,
    skorSosial: 5
  };

  let updatedCount = 0;

  for (const kps of kpsData) {
    let totalWeightedScore = 0;
    let totalActiveWeight = 0;
    
    const { 
      skorPekerjaan, skorSandang, skorPangan, skorPapan, 
      skorKesehatan, skorPendidikan, skorSosial 
    } = kps;

    const totalSkor = skorPekerjaan + skorSandang + skorPangan + skorPapan + skorKesehatan + skorPendidikan + skorSosial;

    if (skorPekerjaan > 0) { totalWeightedScore += (skorPekerjaan / 3) * weights.skorPekerjaan; totalActiveWeight += weights.skorPekerjaan; }
    if (skorPangan > 0) { totalWeightedScore += (skorPangan / 3) * weights.skorPangan; totalActiveWeight += weights.skorPangan; }
    if (skorPapan > 0) { totalWeightedScore += (skorPapan / 3) * weights.skorPapan; totalActiveWeight += weights.skorPapan; }
    if (skorKesehatan > 0) { totalWeightedScore += (skorKesehatan / 3) * weights.skorKesehatan; totalActiveWeight += weights.skorKesehatan; }
    if (skorSandang > 0) { totalWeightedScore += (skorSandang / 3) * weights.skorSandang; totalActiveWeight += weights.skorSandang; }
    if (skorPendidikan > 0) { totalWeightedScore += (skorPendidikan / 3) * weights.skorPendidikan; totalActiveWeight += weights.skorPendidikan; }
    if (skorSosial > 0) { totalWeightedScore += (skorSosial / 3) * weights.skorSosial; totalActiveWeight += weights.skorSosial; }

    let persentaseKelayakan = 0;
    if (totalActiveWeight > 0) {
      persentaseKelayakan = (totalWeightedScore / totalActiveWeight) * 100;
    }

    const statusKeluarga = persentaseKelayakan < 66 ? "Prasejahtera" : "Sejahtera";

    // Cek apakah ada perubahan nilai persentase yang signifikan
    // Kita gunakan Math.round untuk menghindari update berlebihan karena koma kecil
    if (Math.round(kps.persentaseKelayakan) !== Math.round(persentaseKelayakan)) {
      await prisma.kpsData.update({
        where: { id: kps.id },
        data: {
          totalSkor,
          persentaseKelayakan,
          statusKeluarga
        }
      });
      updatedCount++;
    }
  }

  console.log(`Selesai! ${updatedCount} data KPS berhasil diperbarui persentasenya.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
