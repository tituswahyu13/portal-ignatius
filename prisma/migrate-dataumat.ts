// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai migrasi DataUmat...");

  // 1. Baca dan parse CSV
  const csvPath = path.join(__dirname, '../dataumat.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  
  // Asumsi header ada di baris pertama
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Ditemukan ${records.length} baris di CSV.`);

  // 2. Load Lingkungan mapping (untuk mencocokkan ID)
  const lingkungans = await prisma.lingkungan.findMany();
  const lingkunganMap = new Map();
  lingkungans.forEach(l => {
    // normalisasi nama untuk pencocokan yang lebih baik
    lingkunganMap.set(l.namaLingkungan.toUpperCase(), l.id);
  });

  // 3. Masukkan ke DataUmat (Bulk / Batch)
  console.log("Menghapus sisa DataUmat sebelumnya (jika ada)...");
  await prisma.dataUmat.deleteMany({});
  
  console.log("Menyiapkan data untuk dimasukkan (Bulk Insert)...");
  const dataUmatToInsert = [];
  
  for (const row of records) {
    const namaLingkunganCsv = row['Lingkungan']?.toUpperCase() || '';
    const lingId = lingkunganMap.get(namaLingkunganCsv) || null;

    const noKk = row['No. KK'] || null;
    
    let tglLahir = null;
    if (row['Tgl Lahir']) {
      const parts = row['Tgl Lahir'].split('-');
      if (parts.length === 3) {
        tglLahir = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
      }
    }

    dataUmatToInsert.push({
        nama: row['Nama'],
        namaBaptis: row['Nama Baptis'] || null,
        jenisKelamin: row['L/P'] || null,
        kkEncrypted: noKk,
        tanggalLahir: tglLahir,
        lingkunganId: lingId,
        alamat: row['Alamat'] || null,
        agama: row['Agama'] || null,
        statusNikah: row['Status Nikah'] || null,
        pendidikan: row['Pendidikan'] || null,
        pekerjaan: row['Pekerjaan'] || null,
        profesi: row['Profesi'] || null,
        kondisiTubuh: row['Kondisi Tubuh'] || null,
        statusRumah: row['Status Rumah'] || null,
        suku: row['Suku'] || null,
        statusAktivitas: row['Status Aktivitas Sosial'] || null,
        kota: row['Kota'] || null,
        kecamatan: row['Kecamatan'] || null,
        kelurahan: row['Kelurahan'] || null,
    });
  }

  // Chunking insert untuk menghindari Supabase connection limits/timeouts
  const chunkSize = 200;
  for (let i = 0; i < dataUmatToInsert.length; i += chunkSize) {
    const chunk = dataUmatToInsert.slice(i, i + chunkSize);
    await prisma.dataUmat.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`Memasukkan ${i + chunk.length} / ${dataUmatToInsert.length} data...`);
  }
  
  console.log("Berhasil memindahkan data CSV ke DataUmat.");

  // 4. Migrasi KPS Lama agar terhubung ke DataUmat
  console.log("Memulai penautan KPS lama ke DataUmat...");
  const kpsList = await prisma.kpsData.findMany();
  
  let linkedCount = 0;
  for (const kps of kpsList) {
    // Cari umat berdasarkan namaKepalaKeluarga yang BELUM memiliki kpsData
    // (Menghindari error Unique Constraint jika ada nama duplikat di KPS)
    let umatMatch = await prisma.dataUmat.findFirst({
      where: {
        nama: kps.namaKepalaKeluarga,
        lingkunganId: kps.lingkunganId,
        kpsData: {
          is: null
        }
      }
    });

    if (!umatMatch) {
      // Jika tidak ketemu, buat DataUmat baru khusus untuk KPS ini agar tidak hilang
      console.log(`Peringatan: KPS ${kps.namaKepalaKeluarga} tidak ada di CSV. Membuat profil baru.`);
      umatMatch = await prisma.dataUmat.create({
        data: {
          nama: kps.namaKepalaKeluarga,
          kkEncrypted: kps.kkEncrypted,
          nikEncrypted: kps.nikEncrypted,
          alamat: kps.alamat,
          noHp: kps.noHp,
          pekerjaan: kps.pekerjaan,
          tanggalLahir: kps.tanggalLahir,
          lingkunganId: kps.lingkunganId,
        }
      });
    }

    // Tautkan umatId ke KPS
    await prisma.kpsData.update({
      where: { id: kps.id },
      data: { umatId: umatMatch.id }
    });
    linkedCount++;
  }

  console.log(`Berhasil menautkan ${linkedCount} data KPS ke DataUmat.`);

  // 5. Lakukan hal yang sama untuk UMKM jika ada...
  // (Skrip disingkat untuk fokus pada UMKM)
  const umkmList = await prisma.umkmData.findMany();
  let umkmLinked = 0;
  for (const umkm of umkmList) {
    let umatMatch = await prisma.dataUmat.findFirst({
      where: {
        nama: umkm.namaPemilik,
        lingkunganId: umkm.lingkunganId
        // Untuk UMKM, relasinya adalah 1-to-many (UmkmData[] di DataUmat)
        // jadi tidak akan kena error unique constraint.
      }
    });
    if (!umatMatch) {
      umatMatch = await prisma.dataUmat.create({
        data: {
          nama: umkm.namaPemilik,
          lingkunganId: umkm.lingkunganId,
        }
      });
    }
    await prisma.umkmData.update({
      where: { id: umkm.id },
      data: { umatId: umatMatch.id }
    });
    umkmLinked++;
  }
  console.log(`Berhasil menautkan ${umkmLinked} data UMKM ke DataUmat.`);

  console.log("Migrasi selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
