"use server";

import { db as prisma } from "@/lib/db";
import { getCurrentUser, getLingkunganRestriction } from "@/lib/auth/permissions";

export async function getDashboardStats() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Handle data access based on permissions
  const restriction = await getLingkunganRestriction();
  const where: any = {};
  
  if (restriction.restricted) {
    where.lingkunganId = restriction.lingkunganId;
  }

  // 1. Total Umat
  const totalUmat = await prisma.dataUmat.count({ where });

  // 2. Gender Stats
  const rawGender = await prisma.dataUmat.groupBy({
    by: ['jenisKelamin'],
    where,
    _count: {
      id: true,
    }
  });

  const genderStats = [
    { name: 'Laki-laki', value: rawGender.find(g => g.jenisKelamin === 'L')?._count.id || 0 },
    { name: 'Perempuan', value: rawGender.find(g => g.jenisKelamin === 'P')?._count.id || 0 },
    { name: 'Tidak Diketahui', value: rawGender.find(g => !g.jenisKelamin || (g.jenisKelamin !== 'L' && g.jenisKelamin !== 'P'))?._count.id || 0 },
  ].filter(g => g.value > 0);

  // 3. Education Stats
  const rawEdu = await prisma.dataUmat.groupBy({
    by: ['pendidikan'],
    where,
    _count: { id: true }
  });
  
  const eduOrder = [
    'TIDAK/BELUM SEKOLAH', 'KB/TK', 'TK', 'SD', 'SLTP/SMP', 'SMP', 'SLTA/SMA', 'SMA', 
    'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'LAIN-LAIN', 'NON FORMAL'
  ];

  const eduStats = rawEdu.map(e => ({
    name: e.pendidikan || 'Tidak/Belum Sekolah',
    value: e._count.id
  })).sort((a, b) => {
    let indexA = eduOrder.indexOf(a.name.toUpperCase());
    let indexB = eduOrder.indexOf(b.name.toUpperCase());
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    
    // If both are not in array, sort alphabetically
    if (indexA === 99 && indexB === 99) {
        return a.name.localeCompare(b.name);
    }
    return indexA - indexB;
  });

  // 4. Job/Activity Status
  const rawStatus = await prisma.dataUmat.groupBy({
    by: ['statusAktivitas'],
    where,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  const statusStats = rawStatus.map(s => ({
    name: s.statusAktivitas || 'Belum Diisi',
    value: s._count.id
  }));

  // 5. Age Demographics
  // Since date math in group by is complex in prisma without raw queries, 
  // we'll fetch only birth dates and calculate in memory. 
  // It's reasonably fast for ~1000s of rows.
  const birthDates = await prisma.dataUmat.findMany({
    where: { ...where, tanggalLahir: { not: null } },
    select: { tanggalLahir: true }
  });

  let balita = 0, anak = 0, remaja = 0, dewasa = 0, lansia = 0;
  const today = new Date();
  
  birthDates.forEach(u => {
    if (!u.tanggalLahir) return;
    let age = today.getFullYear() - u.tanggalLahir.getFullYear();
    const m = today.getMonth() - u.tanggalLahir.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < u.tanggalLahir.getDate())) {
      age--;
    }

    if (age <= 5) balita++;
    else if (age <= 12) anak++;
    else if (age <= 17) remaja++;
    else if (age < 60) dewasa++;
    else lansia++;
  });

  const ageStats = [
    { name: 'Balita (0-5)', value: balita },
    { name: 'Anak-anak (6-12)', value: anak },
    { name: 'Remaja (13-17)', value: remaja },
    { name: 'Dewasa (18-59)', value: dewasa },
    { name: 'Lansia (≥ 60)', value: lansia },
  ];

  // 6. Stats per Lingkungan (only useful if viewing global/multiple)
  let lingkunganStats: { name: string; value: number }[] = [];
  
  if (!restriction.restricted) {
    const rawLing = await prisma.dataUmat.groupBy({
      by: ['lingkunganId'],
      where,
      _count: { id: true }
    });
    
    // fetch names
    const lingkunganIds = rawLing.map(l => l.lingkunganId).filter(id => id !== null) as number[];
    const lingNames = await prisma.lingkungan.findMany({
      where: { id: { in: lingkunganIds } },
      select: { id: true, namaLingkungan: true }
    });
    
    const lingMap = new Map(lingNames.map(l => [l.id, l.namaLingkungan]));
    
    lingkunganStats = rawLing.map(l => ({
      name: l.lingkunganId ? lingMap.get(l.lingkunganId) || `ID ${l.lingkunganId}` : 'Tidak Ada Lingkungan',
      value: l._count.id
    })).sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // If restricted, the distribution is 100% to their Lingkungan
    const userLing = await prisma.lingkungan.findUnique({
      where: { id: restriction.lingkunganId },
      select: { namaLingkungan: true }
    });
    lingkunganStats = [{ name: userLing?.namaLingkungan || 'Lingkungan', value: totalUmat }];
  }

  return {
    totalUmat,
    genderStats,
    eduStats,
    statusStats,
    ageStats,
    lingkunganStats,
    isGlobal: !restriction.restricted
  };
}
