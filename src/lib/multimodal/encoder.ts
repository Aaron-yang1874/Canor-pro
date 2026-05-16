import type { ModalityType, ImageFeatures, AudioFeatures, VideoFeatures, MultimodalInput } from "@/lib/types";

export function extractTextFeatures(text: string): { semantic: string[]; sentiment: number; keywords: string[] } {
  const keywords = text.split(/[\s,，。！？、]+/).filter((w) => w.length > 0).slice(0, 10);
  const sentiment = keywords.length > 0 ? (Math.random() * 2 - 1) : 0;
  return { semantic: keywords, sentiment, keywords };
}

export function extractImageFeatures(imageData: string): ImageFeatures {
  const hash = simpleHash(imageData.slice(0, 100));
  const colorPalette = ["#1DB954", "#121212", "#FF6B6B", "#4ECDC4", "#FFE66D"];
  return {
    dominantColors: [colorPalette[hash % 5], colorPalette[(hash + 1) % 5], colorPalette[(hash + 2) % 5]],
    brightness: 0.3 + (hash % 100) / 200,
    contrast: 0.4 + (hash % 100) / 250,
    saturation: 0.3 + (hash % 100) / 200,
    composition: ["centered", "rule_of_thirds", "diagonal", "symmetrical"][hash % 4] as ImageFeatures["composition"],
    detectedObjects: ["landscape", "person", "instrument", "abstract"][hash % 4].split(","),
    mood: ["calm", "energetic", "melancholic", "mysterious", "uplifting"][hash % 5],
    textureDensity: 0.2 + (hash % 100) / 125,
  };
}

export function extractAudioFeatures(audioData: string): AudioFeatures {
  const hash = simpleHash(audioData.slice(0, 100));
  const keys = ["C", "Cm", "D", "Dm", "E", "Em", "F", "Fm", "G", "Gm", "A", "Am", "B", "Bm"];
  return {
    tempo: 60 + (hash % 140),
    key: keys[hash % keys.length] as AudioFeatures["key"],
    pitchContour: Array.from({ length: 16 }, (_, i) => Math.sin((hash + i) * 0.1) * 0.5 + 0.5),
    rhythmPattern: ["straight", "swing", "triplet", "dotted", "syncopated"][hash % 5],
    timbreVector: Array.from({ length: 32 }, (_, i) => (hash + i) % 100 / 100),
    harmonicComplexity: 0.2 + (hash % 100) / 125,
    spectralCentroid: 500 + (hash % 3500),
    mfcc: Array.from({ length: 13 }, () => Array.from({ length: 20 }, () => Math.random() * 2 - 1)),
  };
}

export function extractVideoFeatures(videoData: string): VideoFeatures {
  const hash = simpleHash(videoData.slice(0, 100));
  return {
    sceneChanges: Array.from({ length: 5 }, (_, i) => (hash + i * 10) % 100 / 100),
    motionIntensity: Array.from({ length: 10 }, (_, i) => 0.3 + ((hash + i) % 70) / 100),
    colorPalette: Array.from({ length: 5 }, () => ["#1DB954", "#FF6B6B", "#4ECDC4"].slice(0, 2 + (hash % 2))),
    emotionalCurve: Array.from({ length: 20 }, (_, i) => Math.sin((hash + i) * 0.3) * 0.5 + 0.5),
    averageFrameRate: [24, 30, 60][hash % 3],
    duration: 10 + (hash % 290),
    detectedActivities: ["walking", "dancing", "playing", "performing"][hash % 4].split(","),
  };
}

export function encodeMultimodal(input: MultimodalInput): Record<string, unknown> {
  const encoded: Record<string, unknown> = {};
  if (input.textPrompt) {
    encoded.text = extractTextFeatures(input.textPrompt);
  }
  if (input.imageData) {
    encoded.image = extractImageFeatures(input.imageData);
  }
  if (input.audioData) {
    encoded.audio = extractAudioFeatures(input.audioData);
  }
  if (input.videoData) {
    encoded.video = extractVideoFeatures(input.videoData);
  }
  encoded.modalities = input.modalities;
  encoded.fusionStrategy = input.fusionStrategy;
  return encoded;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}