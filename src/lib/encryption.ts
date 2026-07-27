import crypto from "crypto";

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

export function encryptString(text: string): string {
  if (!text) return "";
  
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(String(text), "utf8"),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}

export function decryptString(encryptedText: string): string {
  if (!encryptedText) return "";
  
  try {
    const key = getKey();
    const buffer = Buffer.from(String(encryptedText), "base64");

    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = buffer.subarray(ENCRYPTED_POSITION);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    return "[DECRYPTION_FAILED]";
  }
}
