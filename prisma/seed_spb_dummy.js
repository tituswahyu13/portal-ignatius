"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var admin, intensi1, intensi2, intensi3, kps, lingkungan;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Memulai proses pembuatan data dummy SPB dan Kas & Intensi...");
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: { email: "admin@portal-ignatius.local" }
                        })];
                case 1:
                    admin = _a.sent();
                    if (!admin) {
                        console.error("User admin belum ada. Pastikan sudah menjalankan seed_users.ts");
                        process.exit(1);
                    }
                    return [4 /*yield*/, prisma.intensiAccount.findUnique({ where: { kodeAccount: "INT-PPM" } })];
                case 2:
                    intensi1 = _a.sent();
                    return [4 /*yield*/, prisma.intensiAccount.findUnique({ where: { kodeAccount: "INT-APP" } })];
                case 3:
                    intensi2 = _a.sent();
                    return [4 /*yield*/, prisma.intensiAccount.findUnique({ where: { kodeAccount: "INT-PND" } })];
                case 4:
                    intensi3 = _a.sent();
                    if (!(intensi1 && intensi2 && intensi3)) return [3 /*break*/, 11];
                    console.log("Menambahkan mutasi uang masuk...");
                    // Tambah saldo PPM 50jt
                    return [4 /*yield*/, prisma.financialMutation.create({
                            data: {
                                intensiId: intensi1.id,
                                type: "IN",
                                amount: 50000000,
                                sourceType: "DONASI",
                                description: "Donasi umat awal bulan",
                                createdBy: admin.id
                            }
                        })];
                case 5:
                    // Tambah saldo PPM 50jt
                    _a.sent();
                    return [4 /*yield*/, prisma.intensiAccount.update({ where: { id: intensi1.id }, data: { saldo: { increment: 50000000 } } })];
                case 6:
                    _a.sent();
                    // Tambah saldo APP 20jt
                    return [4 /*yield*/, prisma.financialMutation.create({
                            data: {
                                intensiId: intensi2.id,
                                type: "IN",
                                amount: 20000000,
                                sourceType: "APP",
                                description: "Kolekte APP Prapaskah",
                                createdBy: admin.id
                            }
                        })];
                case 7:
                    // Tambah saldo APP 20jt
                    _a.sent();
                    return [4 /*yield*/, prisma.intensiAccount.update({ where: { id: intensi2.id }, data: { saldo: { increment: 20000000 } } })];
                case 8:
                    _a.sent();
                    // Tambah saldo Pendidikan 15jt
                    return [4 /*yield*/, prisma.financialMutation.create({
                            data: {
                                intensiId: intensi3.id,
                                type: "IN",
                                amount: 15000000,
                                sourceType: "KOLEKTE",
                                description: "Kolekte Misa Minggu ke-2",
                                createdBy: admin.id
                            }
                        })];
                case 9:
                    // Tambah saldo Pendidikan 15jt
                    _a.sent();
                    return [4 /*yield*/, prisma.intensiAccount.update({ where: { id: intensi3.id }, data: { saldo: { increment: 15000000 } } })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [4 /*yield*/, prisma.kpsData.findFirst()];
                case 12:
                    kps = _a.sent();
                    return [4 /*yield*/, prisma.lingkungan.findFirst()];
                case 13:
                    lingkungan = _a.sent();
                    if (!(kps && lingkungan && intensi1)) return [3 /*break*/, 17];
                    console.log("Membuat pengajuan SPB dummy...");
                    // SPB 1: Submitted
                    return [4 /*yield*/, prisma.spbRequest.create({
                            data: {
                                nomorSpb: "SPB/2026/0001",
                                lingkunganId: kps.lingkunganId,
                                kpsId: kps.id,
                                intensiId: intensi1.id, // Dana Papa Miskin
                                kategoriBantuan: "Pangan",
                                totalBiaya: 1000000,
                                danaSwadaya: 100000,
                                danaLingkungan: 200000,
                                danaParokiRequested: 700000,
                                status: "SUBMITTED",
                                createdBy: admin.id
                            }
                        })];
                case 14:
                    // SPB 1: Submitted
                    _a.sent();
                    // SPB 2: Approved Pastor
                    return [4 /*yield*/, prisma.spbRequest.create({
                            data: {
                                nomorSpb: "SPB/2026/0002",
                                lingkunganId: kps.lingkunganId,
                                kpsId: kps.id,
                                intensiId: intensi3.id, // Dana Pendidikan
                                kategoriBantuan: "Pendidikan",
                                totalBiaya: 5000000,
                                danaSwadaya: 500000,
                                danaLingkungan: 500000,
                                danaParokiRequested: 4000000,
                                status: "APPROVED_PASTOR",
                                createdBy: admin.id
                            }
                        })];
                case 15:
                    // SPB 2: Approved Pastor
                    _a.sent();
                    // SPB 3: Realized (Sudah cair)
                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var spbRealized;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.spbRequest.create({
                                            data: {
                                                nomorSpb: "SPB/2026/0003",
                                                lingkunganId: kps.lingkunganId,
                                                kpsId: kps.id,
                                                intensiId: intensi2.id, // Dana APP
                                                kategoriBantuan: "Papan (Bedah Rumah)",
                                                totalBiaya: 10000000,
                                                danaSwadaya: 2000000,
                                                danaLingkungan: 1000000,
                                                danaParokiRequested: 7000000,
                                                status: "REALIZED",
                                                createdBy: admin.id
                                            }
                                        })];
                                    case 1:
                                        spbRealized = _a.sent();
                                        // Potong saldo
                                        return [4 /*yield*/, tx.financialMutation.create({
                                                data: {
                                                    intensiId: intensi2.id,
                                                    type: "OUT",
                                                    amount: 7000000,
                                                    sourceType: "SPB_REALIZATION",
                                                    referenceId: spbRealized.nomorSpb,
                                                    description: "Pencairan dana untuk ".concat(spbRealized.nomorSpb, " - ").concat(spbRealized.kategoriBantuan),
                                                    createdBy: admin.id
                                                }
                                            })];
                                    case 2:
                                        // Potong saldo
                                        _a.sent();
                                        return [4 /*yield*/, tx.intensiAccount.update({
                                                where: { id: intensi2.id },
                                                data: { saldo: { decrement: 7000000 } }
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 16:
                    // SPB 3: Realized (Sudah cair)
                    _a.sent();
                    _a.label = 17;
                case 17:
                    console.log("🎉 Proses penambahan dummy SPB, Kas & Mutasi selesai!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
