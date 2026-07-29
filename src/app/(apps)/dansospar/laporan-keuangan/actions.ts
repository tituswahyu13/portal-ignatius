"use server";

import { db as prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getIntensiAccounts() {
  try {
    return await prisma.intensiAccount.findMany({
      orderBy: { namaIntensi: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching intensi accounts:", error);
    return [];
  }
}

export async function getLaporanKeuangan(filters: {
  startDate?: string;
  endDate?: string;
  intensiId?: string;
  sourceType?: string;
  type?: string;
}) {
  try {
    const whereClause: Prisma.FinancialMutationWhereInput = {};

    if (filters.startDate && filters.endDate) {
      whereClause.transactionDate = {
        gte: new Date(filters.startDate),
        lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999))
      };
    } else if (filters.startDate) {
      whereClause.transactionDate = {
        gte: new Date(filters.startDate)
      };
    } else if (filters.endDate) {
      whereClause.transactionDate = {
        lte: new Date(new Date(filters.endDate).setHours(23, 59, 59, 999))
      };
    }

    if (filters.intensiId && filters.intensiId !== "ALL") {
      whereClause.intensiId = parseInt(filters.intensiId);
    }

    if (filters.sourceType && filters.sourceType !== "ALL") {
      whereClause.sourceType = filters.sourceType as any;
    }

    if (filters.type && filters.type !== "ALL") {
      whereClause.type = filters.type as any;
    }

    const mutations = await prisma.financialMutation.findMany({
      where: whereClause,
      include: {
        intensiAccount: true,
        creator: { select: { name: true } }
      },
      orderBy: { transactionDate: 'desc' }
    });

    return mutations.map(m => ({
      ...m,
      id: m.id.toString(),
      amount: m.amount.toString(),
      createdBy: m.createdBy ? m.createdBy.toString() : null
    }));
  } catch (error) {
    console.error("Error fetching financial report:", error);
    return [];
  }
}
