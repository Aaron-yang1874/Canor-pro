import type { FederatedConfig, FederatedModelState, GradientUpdate } from "@/lib/types";

export function fedAvgAggregation(
  clientUpdates: GradientUpdate[],
  clientDataSizes: number[]
): number[] {
  if (clientUpdates.length === 0) return [];
  const totalSize = clientDataSizes.reduce((a, b) => a + b, 0);
  const numWeights = clientUpdates[0].gradients[0]?.length || 0;
  const weightedSum: number[] = new Array(numWeights).fill(0);

  for (let i = 0; i < clientUpdates.length; i++) {
    const weight = clientDataSizes[i] / totalSize;
    const grads = clientUpdates[i].gradients[0] || [];
    for (let j = 0; j < numWeights; j++) {
      weightedSum[j] += (grads[j] || 0) * weight;
    }
  }
  return weightedSum;
}

export function fedProxAggregation(
  clientUpdates: GradientUpdate[],
  globalWeights: number[],
  mu: number = 0.01
): number[] {
  const fedAvgResult = fedAvgAggregation(clientUpdates, clientUpdates.map(() => 1));
  return fedAvgResult.map((w, i) => w - mu * (w - (globalWeights[i] || 0)));
}

export function validateModel(
  weights: number[],
  validationData: number[][],
  threshold: number = 0.8
): { valid: boolean; accuracy: number } {
  if (validationData.length === 0) return { valid: true, accuracy: 1 };
  let correct = 0;
  for (const sample of validationData) {
    const prediction = weights.reduce((sum, w, i) => sum + w * (sample[i % sample.length] || 0), 0);
    const target = sample[sample.length - 1] || 0;
    if (Math.abs(prediction - target) < 0.2) correct++;
  }
  const accuracy = correct / validationData.length;
  return { valid: accuracy >= threshold, accuracy };
}

export function incrementalUpdate(
  globalWeights: number[],
  delta: number[],
  learningRate: number = 0.1
): number[] {
  return globalWeights.map((w, i) => w + learningRate * (delta[i] || 0));
}

export function globalAggregation(
  regionalStates: FederatedModelState[],
  config: FederatedConfig,
  currentGlobalModel: FederatedModelState
): FederatedModelState {
  const sizes = regionalStates.map((s) => s.participatingClients);

  let newWeights: number[];
  if (config.aggregationStrategy === "fedprox") {
    newWeights = fedProxAggregation(
      regionalStates.map((s, i) => ({
        layerName: "model",
        gradients: [s.globalWeights],
        noiseScale: 0,
        timestamp: s.lastUpdated,
        clientId: `region_${i}`,
        modelVersion: s.modelVersion,
      })),
      currentGlobalModel.globalWeights
    );
  } else {
    newWeights = fedAvgAggregation(
      regionalStates.map((s, i) => ({
        layerName: "model",
        gradients: [s.globalWeights],
        noiseScale: 0,
        timestamp: s.lastUpdated,
        clientId: `region_${i}`,
        modelVersion: s.modelVersion,
      })),
      sizes
    );
  }

  const validated = validateModel(newWeights, []);
  return {
    modelVersion: `${currentGlobalModel.modelVersion.split(".")[0]}.${currentGlobalModel.aggregationRound + 1}`,
    globalWeights: validated.valid ? newWeights : currentGlobalModel.globalWeights,
    aggregationRound: currentGlobalModel.aggregationRound + 1,
    participatingClients: sizes.reduce((a, b) => a + b, 0),
    convergenceMetric: computeConvergence(newWeights, currentGlobalModel.globalWeights),
    lastUpdated: new Date().toISOString(),
  };
}

function computeConvergence(newWeights: number[], oldWeights: number[]): number {
  const diff = newWeights.reduce((sum, w, i) => sum + Math.abs(w - (oldWeights[i] || 0)), 0);
  return 1 / (1 + diff);
}