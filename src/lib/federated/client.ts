import type { GradientUpdate, DifferentialPrivacyParams } from "@/lib/types";
import { encrypt, serializeCiphertext } from "@/lib/homomorphic";
import type { PaillierPublicKey } from "@/lib/homomorphic";

export function computeLocalGradients(
  modelWeights: number[],
  localData: number[][],
  learningRate: number = 0.01
): number[] {
  const gradients: number[] = new Array(modelWeights.length).fill(0);
  for (const sample of localData) {
    for (let i = 0; i < modelWeights.length; i++) {
      const prediction = modelWeights[i] * (sample[i % sample.length] || 0);
      const error = (sample[i % sample.length] || 0) - prediction;
      gradients[i] += error * learningRate;
    }
  }
  return gradients.map((g) => g / localData.length);
}

export function addDifferentialPrivacyNoise(
  gradients: number[],
  params: DifferentialPrivacyParams
): number[] {
  const { noiseMultiplier, maxGradientNorm } = params;
  const norm = Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));
  const clippedGradients = gradients.map((g) => {
    const clipRatio = Math.min(1, maxGradientNorm / (norm + 1e-8));
    return g * clipRatio;
  });
  return clippedGradients.map((g) => {
    const noise = gaussianRandom() * noiseMultiplier;
    return g + noise;
  });
}

export function quantizeGradients(gradients: number[], bits: number = 8): number[] {
  const maxAbs = Math.max(...gradients.map(Math.abs));
  const levels = Math.pow(2, bits - 1) - 1;
  return gradients.map((g) => {
    const quantized = Math.round((g / (maxAbs + 1e-8)) * levels);
    return (quantized / levels) * maxAbs;
  });
}

export function pruneGradients(gradients: number[], sparsity: number = 0.9): number[] {
  const absGradients = gradients.map((g, i) => ({ value: Math.abs(g), index: i }));
  absGradients.sort((a, b) => b.value - a.value);
  const threshold = absGradients[Math.floor(absGradients.length * sparsity)]?.value || 0;
  return gradients.map((g) => (Math.abs(g) >= threshold ? g : 0));
}

export function encryptGradients(
  gradients: number[],
  publicKey: PaillierPublicKey
): string[] {
  return gradients.map((g) => {
    const scaled = Math.round(g * 1e6);
    const ct = encrypt(scaled, publicKey);
    return serializeCiphertext(ct);
  });
}

export function createGradientUpdate(
  gradients: number[],
  clientId: string,
  modelVersion: string,
  privacyParams: DifferentialPrivacyParams
): GradientUpdate {
  const noisyGradients = addDifferentialPrivacyNoise(gradients, privacyParams);
  const compressedGradients = pruneGradients(quantizeGradients(noisyGradients));
  return {
    layerName: "model",
    gradients: [compressedGradients],
    noiseScale: privacyParams.noiseMultiplier,
    timestamp: new Date().toISOString(),
    clientId,
    modelVersion,
  };
}

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
