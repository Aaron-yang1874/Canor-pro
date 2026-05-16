import { encryptData, decryptData, generateEncryptionKey, hashData, deleteUserData, createPrivacyConfig } from "@/lib/safety/privacy";

describe("Privacy Module", () => {
  describe("encryptData and decryptData", () => {
    test("encrypts and decrypts data correctly", () => {
      const originalData = "This is sensitive user data";
      const key = generateEncryptionKey();
      const encrypted = encryptData(originalData, key);
      const decrypted = decryptData(encrypted, key);
      expect(decrypted).toBe(originalData);
    });

    test("produces different ciphertexts for same plaintext with same key", () => {
      const data = "Same data";
      const key = generateEncryptionKey();
      const encrypted1 = encryptData(data, key);
      const encrypted2 = encryptData(data, key);
      expect(encrypted1).not.toBe(encrypted2);
    });

    test("produces different ciphertexts with different keys", () => {
      const data = "Same data";
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const encrypted1 = encryptData(data, key1);
      const encrypted2 = encryptData(data, key2);
      expect(encrypted1).not.toBe(encrypted2);
    });

    test("encrypts empty string", () => {
      const data = "";
      const key = generateEncryptionKey();
      const encrypted = encryptData(data, key);
      const decrypted = decryptData(encrypted, key);
      expect(decrypted).toBe(data);
    });

    test("encrypts unicode data", () => {
      const data = "用户数据 你好世界";
      const key = generateEncryptionKey();
      const encrypted = encryptData(data, key);
      const decrypted = decryptData(encrypted, key);
      expect(decrypted).toBe(data);
    });

    test("encrypts long data", () => {
      const data = "A".repeat(10000);
      const key = generateEncryptionKey();
      const encrypted = encryptData(data, key);
      const decrypted = decryptData(encrypted, key);
      expect(decrypted).toBe(data);
    });

    test("decryption fails with wrong key", () => {
      const data = "Secret data";
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const encrypted = encryptData(data, key1);
      expect(() => decryptData(encrypted, key2)).toThrow();
    });

    test("returns base64 encoded string", () => {
      const data = "test data";
      const key = generateEncryptionKey();
      const encrypted = encryptData(data, key);
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe("hashData", () => {
    test("produces consistent hash for same input", () => {
      const data = "consistent data";
      const hash1 = hashData(data);
      const hash2 = hashData(data);
      expect(hash1).toBe(hash2);
    });

    test("produces different hashes for different inputs", () => {
      const hash1 = hashData("data1");
      const hash2 = hashData("data2");
      expect(hash1).not.toBe(hash2);
    });

    test("produces hex string", () => {
      const hash = hashData("test");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test("hashes empty string", () => {
      const hash = hashData("");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test("hashes unicode data", () => {
      const hash = hashData("你好世界");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("generateEncryptionKey", () => {
    test("generates hex string", () => {
      const key = generateEncryptionKey();
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    test("generates different keys each time", () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const key3 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
      expect(key2).not.toBe(key3);
      expect(key1).not.toBe(key3);
    });

    test("generates 32-byte key (64 hex chars)", () => {
      const key = generateEncryptionKey();
      expect(key.length).toBe(64);
    });
  });

  describe("deleteUserData", () => {
    test("returns success status", () => {
      const result = deleteUserData("user-123");
      expect(result.success).toBe(true);
    });

    test("returns audit ID", () => {
      const result = deleteUserData("user-123");
      expect(result.auditId).toBeDefined();
      expect(typeof result.auditId).toBe("string");
      expect(result.auditId.length).toBeGreaterThan(0);
    });

    test("returns deleted records count", () => {
      const result = deleteUserData("user-456");
      expect(typeof result.deletedRecords).toBe("number");
    });
  });

  describe("createPrivacyConfig", () => {
    test("returns default config with all required fields", () => {
      const config = createPrivacyConfig();
      expect(config.encryptionEnabled).toBe(true);
      expect(config.encryptionAlgorithm).toBe("AES-256-GCM");
      expect(config.localProcessingOnly).toBe(true);
      expect(config.dataRetentionDays).toBe(30);
      expect(config.anonymizationLevel).toBe("full");
      expect(config.consentRequired).toBe(true);
    });

    test("allows overriding with partial config", () => {
      const config = createPrivacyConfig({ encryptionEnabled: false });
      expect(config.encryptionEnabled).toBe(false);
      expect(config.encryptionAlgorithm).toBe("AES-256-GCM");
    });

    test("allows overriding multiple fields", () => {
      const config = createPrivacyConfig({
        localProcessingOnly: false,
        dataRetentionDays: 7,
        consentRequired: false,
      });
      expect(config.localProcessingOnly).toBe(false);
      expect(config.dataRetentionDays).toBe(7);
      expect(config.consentRequired).toBe(false);
      expect(config.encryptionEnabled).toBe(true);
    });
  });
});
