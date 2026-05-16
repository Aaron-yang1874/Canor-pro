import type { ModalityType, MultimodalInput, MultimodalFusion, ImageFeatures, AudioFeatures, VideoFeatures } from "@/lib/types";
import { extractTextFeatures, extractImageFeatures, extractAudioFeatures, extractVideoFeatures } from "./encoder";

const EMBEDDING_DIMENSION = 256;

export function weightedFusion(
  features: Record<ModalityType, Record<string, unknown>>,
  weights: Record<ModalityType, number>
): MultimodalFusion {
  const fusedEmbedding: number[] = new Array(EMBEDDING_DIMENSION).fill(0);
  let totalWeight = 0;
  const contributions: Record<string, number> = {};

  for (const [modality, featureMap] of Object.entries(features) as [ModalityType, Record<string, unknown>][]) {
    const weight = weights[modality] || 0;
    if (weight === 0) continue;
    totalWeight += weight;
    const featureEmbedding = mapFeaturesToEmbedding(featureMap, modality);
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      fusedEmbedding[i] += (featureEmbedding[i] || 0) * weight;
    }
    contributions[modality] = weight;
  }

  if (totalWeight > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      fusedEmbedding[i] /= totalWeight;
    }
  }

  for (const key of Object.keys(contributions)) {
    contributions[key] = (contributions[key] || 0) / totalWeight;
  }

  return {
    fusedEmbedding,
    dimension: EMBEDDING_DIMENSION,
    fusionMethod: "weighted",
    modalityContributions: contributions as Record<ModalityType, number>,
    confidence: Math.min(1, totalWeight / 2),
  };
}

export function attentionFusion(
  features: Record<ModalityType, Record<string, unknown>>
): MultimodalFusion {
  const modalityEntries = Object.entries(features) as [ModalityType, Record<string, unknown>][];
  const embeddings = modalityEntries.map(([modality, featureMap]) => ({
    modality,
    embedding: mapFeaturesToEmbedding(featureMap, modality),
  }));

  const attentionScores = embeddings.map(({ embedding }) => {
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return norm;
  });
  const totalScore = attentionScores.reduce((a, b) => a + b, 0);

  const fusedEmbedding: number[] = new Array(EMBEDDING_DIMENSION).fill(0);
  const contributions: Record<string, number> = {};

  embeddings.forEach(({ modality, embedding }, idx) => {
    const attnWeight = totalScore > 0 ? attentionScores[idx] / totalScore : 1 / embeddings.length;
    contributions[modality] = attnWeight;
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      fusedEmbedding[i] += (embedding[i] || 0) * attnWeight;
    }
  });

  return {
    fusedEmbedding,
    dimension: EMBEDDING_DIMENSION,
    fusionMethod: "attention",
    modalityContributions: contributions as Record<ModalityType, number>,
    confidence: Math.min(1, modalityEntries.length / 3),
  };
}

export function concatFusion(
  features: Record<ModalityType, Record<string, unknown>>
): MultimodalFusion {
  const allEmbeddings: number[] = [];
  const contributions: Record<string, number> = {};
  let count = 0;

  for (const [modality, featureMap] of Object.entries(features) as [ModalityType, Record<string, unknown>][]) {
    const embedding = mapFeaturesToEmbedding(featureMap, modality);
    allEmbeddings.push(...embedding);
    contributions[modality] = 1;
    count++;
  }

  for (const key of Object.keys(contributions)) {
    contributions[key] = 1 / count;
  }

  return {
    fusedEmbedding: allEmbeddings,
    dimension: allEmbeddings.length,
    fusionMethod: "concat",
    modalityContributions: contributions as Record<ModalityType, number>,
    confidence: Math.min(1, count / 4),
  };
}

export function fuseMultimodal(input: MultimodalInput): MultimodalFusion {
  const features: Record<ModalityType, Record<string, unknown>> = {} as Record<ModalityType, Record<string, unknown>>;

  if (input.textPrompt) {
    features.text = extractTextFeatures(input.textPrompt) as unknown as Record<string, unknown>;
  }
  if (input.imageData) {
    features.image = extractImageFeatures(input.imageData) as unknown as Record<string, unknown>;
  }
  if (input.audioData) {
    features.audio = extractAudioFeatures(input.audioData) as unknown as Record<string, unknown>;
  }
  if (input.videoData) {
    features.video = extractVideoFeatures(input.videoData) as unknown as Record<string, unknown>;
  }

  switch (input.fusionStrategy) {
    case "attention":
      return attentionFusion(features);
    case "concat":
      return concatFusion(features);
    case "weighted":
    default:
      return weightedFusion(features, input.modalityWeights);
  }
}

function mapFeaturesToEmbedding(featureMap: Record<string, unknown>, modality: ModalityType): number[] {
  const embedding: number[] = new Array(EMBEDDING_DIMENSION).fill(0);
  let idx = 0;
  for (const [, value] of Object.entries(featureMap)) {
    if (typeof value === "number") {
      embedding[idx % EMBEDDING_DIMENSION] = Math.tanh(value);
      idx++;
    } else if (typeof value === "string") {
      embedding[idx % EMBEDDING_DIMENSION] = (value.length % 100) / 100;
      idx++;
    } else if (Array.isArray(value) && value.every((v) => typeof v === "number")) {
      for (let j = 0; j < Math.min(value.length, 16); j++) {
        embedding[(idx + j) % EMBEDDING_DIMENSION] = Math.tanh(value[j] || 0);
      }
      idx += 16;
    }
  }
  return embedding;
}