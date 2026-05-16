import type { GradientUpdate, FederatedModelState } from "@/lib/types";
import { generateKeyPair, encrypt, decrypt, addCiphertexts } from "@/lib/homomorphic";

export function secureAggregation(updates: GradientUpdate[]): number[] {
  if (updates.length === 0) return [];
  const numWeights = updates[0].gradients[0]?.length || 0;
  const keyPair = generateKeyPair();

  const allCiphertexts: bigint[][] = updates.map((update) => {
    const grads = update.gradients[0] || [];
    return grads.map((g) => encrypt(Math.round(g * 1e6), keyPair.publicKey));
  });

  const aggregated: bigint[] = new Array(numWeights).fill(1n);
  for (const cts of allCiphertexts) {
    for (let i = 0; i < numWeights; i++) {
      aggregated[i] = addCiphertexts(aggregated[i], cts[i] || 1n, keyPair.publicKey);
    }
  }

  return aggregated.map((ct) => {
    const raw = Number(decrypt(ct, keyPair.privateKey));
    return raw / 1e6 / updates.length;
  });
}

export function knowledgeDistillation(
  teacherWeights: number[],
  studentWeights: number[],
  temperature: number = 3.0
): number[] {
  const softTeacher = teacherWeights.map((w) => Math.exp(w / temperature));
  const sumTeacher = softTeacher.reduce((a, b) => a + b, 0);
  const teacherProbs = softTeacher.map((s) => s / sumTeacher);

  const softStudent = studentWeights.map((w) => Math.exp(w / temperature));
  const sumStudent = softStudent.reduce((a, b) => a + b, 0);
  const studentProbs = softStudent.map((s) => s / sumStudent);

  const alpha = 0.7;
  return teacherProbs.map((tp, i) => alpha * tp + (1 - alpha) * (studentProbs[i] || 0));
}

export function regionalSync(
  localUpdates: GradientUpdate[],
  currentModel: FederatedModelState
): FederatedModelState {
  const aggregated = secureAggregation(localUpdates);
  const distilledWeights = knowledgeDistillation(
    currentModel.globalWeights,
    aggregated
  );
  return {
    ...currentModel,
    globalWeights: distilledWeights,
    aggregationRound: currentModel.aggregationRound + 1,
    participatingClients: localUpdates.length,
    lastUpdated: new Date().toISOString(),
  };
}
