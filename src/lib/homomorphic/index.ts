export {
  modPow,
  gcd,
  lcm,
  randomBigInt,
  generateKeyPair,
  encrypt,
  decrypt,
  addCiphertexts,
  scalarMultiply,
  serializeCiphertext,
  deserializeCiphertext,
} from "@/lib/homomorphic/paillier";
export type {
  PaillierPublicKey,
  PaillierPrivateKey,
  PaillierKeyPair,
} from "@/lib/homomorphic/paillier";
export { secureAggregate } from "@/lib/homomorphic/aggregation";
export type { EncryptedGradient } from "@/lib/homomorphic/aggregation";
