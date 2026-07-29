"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
const modelsWithSoftDelete = [
    "FinancialMutation",
    "SpbRequest",
    "KpsData",
    "UmkmData",
];
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
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
                async softDelete(where, userId) {
                    const context = client_1.Prisma.getExtensionContext(this);
                    return context.update({
                        where,
                        data: { deletedAt: new Date(), deletedBy: userId },
                    });
                },
                async safeCreate(args, userId) {
                    const context = client_1.Prisma.getExtensionContext(this);
                    return context.create({
                        ...args,
                        data: { ...args.data, createdBy: userId },
                    });
                },
                async safeUpdate(args, userId) {
                    const context = client_1.Prisma.getExtensionContext(this);
                    return context.update({
                        ...args,
                        data: { ...args.data, updatedBy: userId },
                    });
                },
            },
        },
    });
};
const globalForPrisma = globalThis;
exports.db = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.db;
