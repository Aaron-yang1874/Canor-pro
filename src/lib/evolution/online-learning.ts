import type { OnlineLearningRecord } from "@/lib/types";

export interface ExperienceReplayBuffer {
  capacity: number;
  memory: OnlineLearningRecord[];
}

export function createReplayBuffer(capacity: number = 1000): ExperienceReplayBuffer {
  return { capacity, memory: [] };
}

export function pushExperience(buffer: ExperienceReplayBuffer, record: OnlineLearningRecord): void {
  if (buffer.memory.length >= buffer.capacity) {
    buffer.memory.shift();
  }
  buffer.memory.push(record);
}

export function sampleBatch(buffer: ExperienceReplayBuffer, batchSize: number = 8): OnlineLearningRecord[] {
  const size = Math.min(batchSize, buffer.memory.length);
  const shuffled = [...buffer.memory].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

export function computeReward(feedback: { rating?: number; liked?: boolean; listenTime?: number; totalDuration?: number; skipped?: boolean }): number {
  let reward = 0;
  if (feedback.rating !== undefined) {
    reward += (feedback.rating - 3) * 0.5;
  }
  if (feedback.liked !== undefined) {
    reward += feedback.liked ? 1.0 : -0.5;
  }
  if (feedback.listenTime !== undefined && feedback.totalDuration !== undefined && feedback.totalDuration > 0) {
    reward += Math.min(feedback.listenTime / feedback.totalDuration, 1.0) * 0.5;
  }
  if (feedback.skipped) {
    reward -= 0.3;
  }
  return Math.max(-1, Math.min(1, reward));
}

export function updateUserPreferenceVector(
  currentVector: number[],
  interactionInput: Record<string, unknown>,
  reward: number,
  learningRate: number = 0.01
): number[] {
  const inputSignal = Object.values(interactionInput).reduce<number>((acc: number, val: unknown) => {
    if (typeof val === "number") return acc + val;
    if (typeof val === "string") return acc + val.length;
    return acc;
  }, 0) * 0.001;

  return currentVector.map((v) => {
    const noise = (Math.random() - 0.5) * 0.01;
    return v + learningRate * reward * inputSignal + noise;
  });
}

export function processInteraction(
  buffer: ExperienceReplayBuffer,
  record: OnlineLearningRecord,
  preferenceVector: number[]
): { updatedVector: number[]; reward: number } {
  pushExperience(buffer, record);
  const reward = record.reward;
  const updatedVector = updateUserPreferenceVector(preferenceVector, record.input, reward);
  return { updatedVector, reward };
}