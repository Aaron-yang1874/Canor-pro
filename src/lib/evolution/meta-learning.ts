import type { EvolutionConfig, MetaLearningState } from "@/lib/types";

export function initializeMetaLearningState(): MetaLearningState {
  return {
    taskDistribution: [],
    adaptedParameters: {},
    metaGradient: [],
    innerLoopSteps: 5,
    outerLoopSteps: 10,
    currentEpoch: 0,
    convergenceScore: 0,
  };
}

export function sampleTask(taskDistribution: string[]): string {
  return taskDistribution[Math.floor(Math.random() * taskDistribution.length)];
}

export function innerLoopAdapt(params: Record<string, number>, learningRate: number, _steps: number): Record<string, number> {
  const adapted: Record<string, number> = {};
  for (const [key, value] of Object.entries(params)) {
    adapted[key] = value - learningRate * (Math.random() - 0.5) * 0.1;
  }
  return adapted;
}

export function outerLoopMetaUpdate(
  metaGradient: number[],
  taskLosses: number[],
  beta: number
): number[] {
  const avgLoss = taskLosses.reduce((a, b) => a + b, 0) / taskLosses.length;
  return metaGradient.map((g) => g - beta * avgLoss * g);
}

export function ewcPenalty(currentParams: Record<string, number>, previousParams: Record<string, number>, importance: number): number {
  let penalty = 0;
  for (const key of Object.keys(currentParams)) {
    const diff = (currentParams[key] || 0) - (previousParams[key] || 0);
    penalty += importance * diff * diff;
  }
  return penalty;
}

export function loraUpdate(weights: number[], gradients: number[], rank: number, alpha: number): number[] {
  return weights.map((w, i) => w - alpha * (gradients[i] || 0) * (1 / rank));
}

export function computeConvergenceScore(lossHistory: number[]): number {
  if (lossHistory.length < 2) return 0;
  const recent = lossHistory.slice(-5);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance = recent.reduce((sum, val) => sum + (val - mean) ** 2, 0) / recent.length;
  return 1 / (1 + variance);
}

export function updateMetaLearningState(state: MetaLearningState, config: EvolutionConfig, loss: number): MetaLearningState {
  const lossHistory: number[] = [];
  for (let i = 0; i < state.outerLoopSteps; i++) {
    lossHistory.push(loss * (1 + (Math.random() - 0.5) * 0.1));
  }
  return {
    ...state,
    currentEpoch: state.currentEpoch + 1,
    convergenceScore: computeConvergenceScore(lossHistory),
    metaGradient: state.metaGradient.length > 0 ? state.metaGradient : Array(10).fill(0).map(() => (Math.random() - 0.5) * 0.01),
  };
}