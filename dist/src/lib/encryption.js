"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptString = encryptString;
exports.decryptString = decryptString;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;
// Memastikan key tersedia di environment
function getKey() {
    const key = process.env.DATA_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error("DATA_ENCRYPTION_KEY belum disetel atau panjangnya bukan 64 karakter (32 byte hex).");
    }
    return Buffer.from(key, "hex");
}
function encryptString(text) {
    if (!text)
        return "";
    const key = getKey();
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const salt = crypto_1.default.randomBytes(SALT_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(String(text), "utf8"),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}
function decryptString(encryptedText) {
    if (!encryptedText)
        return "";
    try {
        const key = getKey();
        const buffer = Buffer.from(String(encryptedText), "base64");
        const salt = buffer.subarray(0, SALT_LENGTH);
        const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
        const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
        const encrypted = buffer.subarray(ENCRYPTED_POSITION);
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final("utf8");
    }
    catch (error) {
        console.error("Decryption error:", error);
        return "[DECRYPTION_FAILED]";
    }
}
