import { extractFingerprint } from "@/lib/fingerprint/chromaprint";
import { computeMinHashSignature, jaccardSimilarity } from "@/lib/fingerprint/minhash";

export interface CopyrightComparisonResult {
  similarity: number;
  isViolation: boolean;
  matchedWorkId?: string;
}

export const COPYRIGHT_THRESHOLD = 0.7;

const copyrightDatabase = new Map<string, number[]>();

export function registerCopyright(workId: string, signature: number[]): void {
  copyrightDatabase.set(workId, signature);
}

export function clearCopyrightDatabase(): void {
  copyrightDatabase.clear();
}

export function getCopyrightDatabaseSize(): number {
  return copyrightDatabase.size;
}

export async function fingerprintAndCompare(
  audioBuffer: ArrayBuffer,
  threshold: number = COPYRIGHT_THRESHOLD
): Promise<CopyrightComparisonResult> {
  const fingerprint = await extractFingerprint(audioBuffer);
  const signature = computeMinHashSignature(fingerprint.features);

  let maxSimilarity = 0;
  let matchedWorkId: string | undefined;

  for (const [workId, registeredSig] of copyrightDatabase) {
    const similarity = jaccardSimilarity(signature, registeredSig);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      matchedWorkId = workId;
    }
  }

  return {
    similarity: maxSimilarity,
    isViolation: maxSimilarity >= threshold,
    matchedWorkId: maxSimilarity >= threshold ? matchedWorkId : undefined,
  };
}
