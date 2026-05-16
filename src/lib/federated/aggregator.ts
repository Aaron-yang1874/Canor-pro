import { randomBytes } from "crypto";
import type { GradientUpdate, FederatedModelState } from "@/lib/types";

/** @deprecated 模拟实现，生产环境必须接入 node-seal 或联邦学习服务端 */
export function homomorphicEncrypt(_data: number[]): { encrypted: number[]; key: string } {
  const key = generateEncryptionKey();
  const encrypted = _data.map((v, i) => v + simpleHash(key + i) * 0.001);
  return { encrypted, key };
}

/** @deprecated 模拟实现，生产环境必须接入 node-seal 或联邦学习服务端 */
export function homomorphicDecrypt(encrypted: number[], key: string): number[] {
  return encrypted.map((v, i) => v - simpleHash(key + i) * 0.001);
}

export function secureAggregation(updates: GradientUpdate[]): number[] {
  if (updates.length === 0) return [];
  const numWeights = updates[0].gradients[0]?.length || 0;
  const aggregated: number[] = new Array(numWeights).fill(0);
  for (const update of updates) {
    const grads = update.gradients[0] || [];
    for (let i = 0; i < numWeights; i++) {
      aggregated[i] += grads[i] || 0;
    }
  }
  return aggregated.map((g) => g / updates.length);
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

function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex");
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}