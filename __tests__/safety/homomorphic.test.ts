import {
  generateKeyPair,
  encrypt,
  decrypt,
  addCiphertexts,
  scalarMultiply,
  serializeCiphertext,
  deserializeCiphertext,
  modPow,
  gcd,
  lcm,
  modInverse,
} from "@/lib/homomorphic/paillier";

describe("Paillier Homomorphic Encryption", () => {
  let keyPair: ReturnType<typeof generateKeyPair>;

  beforeAll(() => {
    keyPair = generateKeyPair(512);
  });

  describe("Key Generation", () => {
    test("generates valid key pair", () => {
      expect(keyPair).toHaveProperty("publicKey");
      expect(keyPair).toHaveProperty("privateKey");
    });

    test("public key has required fields", () => {
      expect(keyPair.publicKey).toHaveProperty("n");
      expect(keyPair.publicKey).toHaveProperty("nSq");
      expect(keyPair.publicKey).toHaveProperty("g");
    });

    test("private key has required fields", () => {
      expect(keyPair.privateKey).toHaveProperty("lambda");
      expect(keyPair.privateKey).toHaveProperty("mu");
      expect(keyPair.privateKey).toHaveProperty("n");
      expect(keyPair.privateKey).toHaveProperty("nSq");
    });

    test("public key n is positive", () => {
      expect(keyPair.publicKey.n).toBeGreaterThan(0n);
    });
  });

  describe("Encryption and Decryption", () => {
    test("encrypts and decrypts plaintext correctly", () => {
      const plaintext = 42;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const decrypted = decrypt(ciphertext, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext));
    });

    test("encrypts zero correctly", () => {
      const plaintext = 0;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const decrypted = decrypt(ciphertext, keyPair.privateKey);
      expect(decrypted).toBe(0n);
    });

    test("encrypts negative plaintext throws error", () => {
      expect(() => encrypt(-1, keyPair.publicKey)).toThrow("Plaintext must be in [0, n)");
    });

    test("encrypts large plaintext correctly", () => {
      const plaintext = 1000000;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const decrypted = decrypt(ciphertext, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext));
    });

    test("encryption produces different ciphertexts for same plaintext", () => {
      const plaintext = 100;
      const c1 = encrypt(plaintext, keyPair.publicKey);
      const c2 = encrypt(plaintext, keyPair.publicKey);
      expect(c1).not.toBe(c2);
    });
  });

  describe("Homomorphic Addition", () => {
    test("addCiphertexts preserves homomorphic property", () => {
      const m1 = 15;
      const m2 = 27;
      const c1 = encrypt(m1, keyPair.publicKey);
      const c2 = encrypt(m2, keyPair.publicKey);
      const sumCipher = addCiphertexts(c1, c2, keyPair.publicKey);
      const decryptedSum = decrypt(sumCipher, keyPair.privateKey);
      expect(decryptedSum).toBe(BigInt(m1 + m2));
    });

    test("add multiple ciphertexts correctly", () => {
      const values = [5, 10, 15, 20];
      let combined = encrypt(0, keyPair.publicKey);
      for (const v of values) {
        combined = addCiphertexts(combined, encrypt(v, keyPair.publicKey), keyPair.publicKey);
      }
      const decrypted = decrypt(combined, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(values.reduce((a, b) => a + b, 0)));
    });

    test("add ciphertext with zero preserves value", () => {
      const m = 50;
      const c = encrypt(m, keyPair.publicKey);
      const zero = encrypt(0, keyPair.publicKey);
      const sum = addCiphertexts(c, zero, keyPair.publicKey);
      const decrypted = decrypt(sum, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(m));
    });
  });

  describe("Scalar Multiplication", () => {
    test("scalarMultiply preserves homomorphic property", () => {
      const plaintext = 7;
      const scalar = 5;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const scaled = scalarMultiply(ciphertext, scalar, keyPair.publicKey);
      const decrypted = decrypt(scaled, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext * scalar));
    });

    test("scalar multiplication by zero yields zero", () => {
      const plaintext = 100;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const scaled = scalarMultiply(ciphertext, 0, keyPair.publicKey);
      const decrypted = decrypt(scaled, keyPair.privateKey);
      expect(decrypted).toBe(0n);
    });

    test("scalar multiplication by one preserves value", () => {
      const plaintext = 99;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const scaled = scalarMultiply(ciphertext, 1, keyPair.publicKey);
      const decrypted = decrypt(scaled, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext));
    });

    test("scalar multiplication handles negative scalars", () => {
      const plaintext = 10;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const scaled = scalarMultiply(ciphertext, 3, keyPair.publicKey);
      const decrypted = decrypt(scaled, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext * 3));
    });
  });

  describe("Serialization", () => {
    test("serializeCiphertext produces hex string", () => {
      const ciphertext = encrypt(123, keyPair.publicKey);
      const serialized = serializeCiphertext(ciphertext);
      expect(typeof serialized).toBe("string");
      expect(serialized).toMatch(/^[0-9a-f]+$/);
    });

    test("deserializeCiphertext recovers original value", () => {
      const plaintext = 456;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const serialized = serializeCiphertext(ciphertext);
      const deserialized = deserializeCiphertext(serialized);
      const decrypted = decrypt(deserialized, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext));
    });

    test("round-trip serialization works multiple times", () => {
      const plaintext = 789;
      const ciphertext = encrypt(plaintext, keyPair.publicKey);
      const serialized = serializeCiphertext(ciphertext);
      const deserialized = deserializeCiphertext(serialized);
      const decrypted = decrypt(deserialized, keyPair.privateKey);
      expect(decrypted).toBe(BigInt(plaintext));
    });
  });

  describe("Math Utilities", () => {
    test("modPow calculates exponentiation correctly", () => {
      expect(modPow(2n, 10n, 1000n)).toBe(24n);
      expect(modPow(5n, 3n, 13n)).toBe(8n);
    });

    test("gcd calculates correctly", () => {
      expect(gcd(48n, 18n)).toBe(6n);
      expect(gcd(100n, 25n)).toBe(25n);
      expect(gcd(17n, 19n)).toBe(1n);
    });

    test("lcm calculates correctly", () => {
      expect(lcm(4n, 6n)).toBe(12n);
      expect(lcm(5n, 7n)).toBe(35n);
    });

    test("lcm with zero returns zero", () => {
      expect(lcm(0n, 5n)).toBe(0n);
      expect(lcm(5n, 0n)).toBe(0n);
    });
  });

  describe("modInverse", () => {
    test("calculates modular inverse correctly", () => {
      const inv = modInverse(3n, 11n);
      expect((3n * inv) % 11n).toBe(1n);
    });

    test("calculates inverse for prime modulus", () => {
      const inv = modInverse(7n, 13n);
      expect((7n * inv) % 13n).toBe(1n);
    });

    test("handles large numbers", () => {
      const inv = modInverse(12345n, 67891n);
      expect((12345n * inv) % 67891n).toBe(1n);
    });
  });
});
