import { PrismaClient, Prisma } from "@prisma/client";

const modelsWithSoftDelete = [
  "FinancialMutation",
  "SpbRequest",
  "KpsData",
  "UmkmData",
];

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (modelsWithSoftDelete.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (modelsWithSoftDelete.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (modelsWithSoftDelete.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }
          return query(args);
        },
      },
    },
    model: {
      $allModels: {
        async softDelete<T>(
          this: T,
          where: any,
          userId: bigint
        ) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            where,
            data: { deletedAt: new Date(), deletedBy: userId },
          });
        },
        async safeCreate<T>(
          this: T,
          args: any,
          userId: bigint
        ) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).create({
            ...args,
            data: { ...args.data, createdBy: userId },
          });
        },
        async safeUpdate<T>(
          this: T,
          args: any,
          userId: bigint
        ) {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            ...args,
            data: { ...args.data, updatedBy: userId },
          });
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
