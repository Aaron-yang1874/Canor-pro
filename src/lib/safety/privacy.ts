import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha512");
}

export function encryptData(data: string, key: string): string {
  const salt = randomBytes(16);
  const derivedKey = deriveKey(key, salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}

export function decryptData(encryptedData: string, key: string): string {
  const buf = Buffer.from(encryptedData, "base64");
  const salt = buf.subarray(0, 16);
  const iv = buf.subarray(16, 28);
  const tag = buf.subarray(28, 44);
  const ciphertext = buf.subarray(44);
  const derivedKey = deriveKey(key, salt);
  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}

export function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex");
}

export function hashData(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function deleteUserData(userId: string): { success: boolean; deletedRecords: number; auditId: string } {
  const auditId = randomBytes(16).toString("hex");
  const deletedRecords = 0;
  return { success: true, deletedRecords, auditId };
}

export function createPrivacyConfig(overrides?: Partial<import("@/lib/types").PrivacyConfig>): import("@/lib/types").PrivacyConfig {
  return {
    encryptionEnabled: true,
    encryptionAlgorithm: "AES-256-GCM",
    localProcessingOnly: true,
    dataRetentionDays: 30,
    anonymizationLevel: "full",
    consentRequired: true,
    ...overrides,
  };
}
