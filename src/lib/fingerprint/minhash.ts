export const NUM_PERM = 128;
export const MAX_HASH = (1 << 32) - 1;

export interface HashFunction {
  a: number;
  b: number;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateHashFunctions(seed: number = 42): HashFunction[] {
  const rng = mulberry32(seed);
  const functions: HashFunction[] = [];
  for (let i = 0; i < NUM_PERM; i++) {
    functions.push({
      a: Math.floor(rng() * MAX_HASH) + 1,
      b: Math.floor(rng() * MAX_HASH),
    });
  }
  return functions;
}

const HASH_FUNCTIONS = generateHashFunctions(42);

export function computeMinHashSignature(features: number[]): number[] {
  const quantized = features.map((f) => Math.round(f * 10000));
  const signature: number[] = new Array(NUM_PERM);

  for (let i = 0; i < NUM_PERM; i++) {
    const { a, b } = HASH_FUNCTIONS[i];
    let minHash = MAX_HASH;

    for (const val of quantized) {
      const hash = ((a * val + b) >>> 0) & MAX_HASH;
      if (hash < minHash) {
        minHash = hash;
      }
    }

    signature[i] = minHash;
  }

  return signature;
}

export function jaccardSimilarity(sig1: number[], sig2: number[]): number {
  if (sig1.length !== sig2.length || sig1.length === 0) return 0;

  let matches = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) {
      matches++;
    }
  }

  return matches / sig1.length;
}
