// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai perbaikan lingkunganId di DataUmat...");

  const csvPath = path.join(__dirname, '../dataumat.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const lingkungans = await prisma.lingkungan.findMany();
  
  // Create a normalized map where multiple spaces are reduced to one
  const normalize = (str) => str ? str.toUpperCase().replace(/\s+/g, ' ').trim() : '';
  
  const lingkunganMap = new Map();
  lingkungans.forEach(l => {
    lingkunganMap.set(normalize(l.namaLingkungan), l.id);
  });

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const row of records) {
    const rawLingkungan = row['Lingkungan'] || row['Nama Lingkungan'];
    const normalizedCsv = normalize(rawLingkungan);
    
    const lingId = lingkunganMap.get(normalizedCsv);
    
    if (lingId) {
      // Find the user in DataUmat by name and address (or KK)
      const kk = row['No. KK'] ? row['No. KK'].trim() : null;
      
      const umat = await prisma.dataUmat.findFirst({
        where: {
          nama: row['Nama'],
          ...(kk ? { kkEncrypted: kk } : {})
        }
      });
      
      if (umat && !umat.lingkunganId) {
        await prisma.dataUmat.update({
          where: { id: umat.id },
          data: { lingkunganId: lingId }
        });
        updatedCount++;
      }
    } else {
      notFoundCount++;
    }
  }

  console.log(`Berhasil mengupdate lingkunganId untuk ${updatedCount} umat.`);
  if (notFoundCount > 0) {
    console.log(`Peringatan: ${notFoundCount} baris tidak menemukan map lingkungan yang cocok.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
