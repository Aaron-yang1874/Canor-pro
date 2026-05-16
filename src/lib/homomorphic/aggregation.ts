import type { PaillierKeyPair } from "@/lib/homomorphic/paillier";
import {
  addCiphertexts,
  decrypt,
  scalarMultiply,
  deserializeCiphertext,
  serializeCiphertext,
} from "@/lib/homomorphic/paillier";

export interface EncryptedGradient {
  clientId: string;
  ciphertexts: string[];
  weight: number;
}

export function secureAggregate(
  encryptedGradients: EncryptedGradient[],
  keyPair: PaillierKeyPair
): number[] {
  if (encryptedGradients.length === 0) return [];

  const numWeights = encryptedGradients[0].ciphertexts.length;
  const totalWeight = encryptedGradients.reduce((sum, eg) => sum + eg.weight, 0);
  const aggregated: bigint[] = new Array(numWeights).fill(1n);

  for (const eg of encryptedGradients) {
    for (let i = 0; i < numWeights; i++) {
      const ct = deserializeCiphertext(eg.ciphertexts[i]);
      const weighted = scalarMultiply(ct, eg.weight, keyPair.publicKey);
      aggregated[i] = addCiphertexts(aggregated[i], weighted, keyPair.publicKey);
    }
  }

  return aggregated.map((ct) => {
    const raw = Number(decrypt(ct, keyPair.privateKey));
    return raw / totalWeight;
  });
}
