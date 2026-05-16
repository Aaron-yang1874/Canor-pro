import { randomBytes } from "crypto";

export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = ((base % mod) + mod) % mod;
  while (exp > 0n) {
    if (exp & 1n) {
      result = (result * base) % mod;
    }
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  const absA = a < 0n ? -a : a;
  const absB = b < 0n ? -b : b;
  return (absA / gcd(absA, absB)) * absB;
}

export function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }
  if (old_r !== 1n) throw new Error("Modular inverse does not exist");
  return ((old_s % m) + m) % m;
}

export function randomBigInt(max: bigint): bigint {
  const bits = max.toString(2).length;
  const bytes = Math.ceil(bits / 8);
  let result: bigint;
  do {
    const buf = randomBytes(bytes);
    result = BigInt("0x" + buf.toString("hex"));
    result = result >> BigInt(bytes * 8 - bits);
  } while (result >= max || result === 0n);
  return result;
}

function millerRabinTest(n: bigint, k: number = 20): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  let r = 0n;
  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    r++;
  }

  for (let i = 0; i < k; i++) {
    const a = randomBigInt(n - 4n) + 2n;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let j = 1n; j < r; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

function generatePrime(bitLength: number): bigint {
  while (true) {
    const bytes = Math.ceil(bitLength / 8);
    const buf = randomBytes(bytes);
    let candidate = BigInt("0x" + buf.toString("hex"));
    candidate |= (1n << BigInt(bitLength - 1));
    candidate |= 1n;
    if (millerRabinTest(candidate)) {
      return candidate;
    }
  }
}

export interface PaillierPublicKey {
  n: bigint;
  nSq: bigint;
  g: bigint;
}

export interface PaillierPrivateKey {
  lambda: bigint;
  mu: bigint;
  n: bigint;
  nSq: bigint;
}

export interface PaillierKeyPair {
  publicKey: PaillierPublicKey;
  privateKey: PaillierPrivateKey;
}

export function generateKeyPair(bitLength: number = 2048): PaillierKeyPair {
  const halfBits = Math.floor(bitLength / 2);
  const p = generatePrime(halfBits);
  const q = generatePrime(halfBits);
  const n = p * q;
  const nSq = n * n;
  const lambda = lcm(p - 1n, q - 1n);
  const g = n + 1n;
  const mu = modInverse(lambda, n);
  return {
    publicKey: { n, nSq, g },
    privateKey: { lambda, mu, n, nSq },
  };
}

export function encrypt(plaintext: number, publicKey: PaillierPublicKey): bigint {
  const m = BigInt(plaintext);
  if (m < 0n || m >= publicKey.n) {
    throw new RangeError("Plaintext must be in [0, n)");
  }
  const r = randomBigInt(publicKey.n);
  const gm = modPow(publicKey.g, m, publicKey.nSq);
  const rn = modPow(r, publicKey.n, publicKey.nSq);
  return (gm * rn) % publicKey.nSq;
}

export function decrypt(ciphertext: bigint, privateKey: PaillierPrivateKey): bigint {
  const x = modPow(ciphertext, privateKey.lambda, privateKey.nSq);
  const l = (x - 1n) / privateKey.n;
  return (l * privateKey.mu) % privateKey.n;
}

export function addCiphertexts(c1: bigint, c2: bigint, publicKey: PaillierPublicKey): bigint {
  return (c1 * c2) % publicKey.nSq;
}

export function scalarMultiply(ciphertext: bigint, scalar: number, publicKey: PaillierPublicKey): bigint {
  const k = BigInt(scalar);
  return modPow(ciphertext, k, publicKey.nSq);
}

export function serializeCiphertext(c: bigint): string {
  return c.toString(16);
}

export function deserializeCiphertext(s: string): bigint {
  return BigInt("0x" + s);
}
