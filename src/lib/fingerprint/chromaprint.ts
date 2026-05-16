export interface AudioFingerprint {
  hash: string;
  features: number[];
  duration: number;
}

const FRAME_SIZE = 4096;
const HOP_SIZE = 2048;

function computeRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

function computeZCR(samples: Float32Array): number {
  if (samples.length < 2) return 0;
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / (samples.length - 1);
}

async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function extractFeaturesFromSamples(samples: Float32Array, sampleRate: number): number[] {
  const features: number[] = [];
  const numFrames = Math.floor((samples.length - FRAME_SIZE) / HOP_SIZE) + 1;

  for (let i = 0; i < numFrames; i++) {
    const start = i * HOP_SIZE;
    const frame = samples.subarray(start, start + FRAME_SIZE);
    features.push(computeRMS(frame));
    features.push(computeZCR(frame));
  }

  return features;
}

function fallbackDecode(audioBuffer: ArrayBuffer): Float32Array {
  const view = new DataView(audioBuffer);
  const numSamples = Math.floor(audioBuffer.byteLength / 2);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const offset = i * 2;
    if (offset + 2 <= audioBuffer.byteLength) {
      const int16 = view.getInt16(offset, true);
      samples[i] = int16 / 32768;
    }
  }
  return samples;
}

export async function extractFingerprint(audioBuffer: ArrayBuffer): Promise<AudioFingerprint> {
  let features: number[];
  let duration: number;

  const AudioContextCtor = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    || (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (AudioContextCtor) {
    const ctx = new AudioContextCtor();
    try {
      const decoded = await ctx.decodeAudioData(audioBuffer.slice(0));
      const channelData = decoded.getChannelData(0);
      duration = decoded.duration;
      features = extractFeaturesFromSamples(channelData, decoded.sampleRate);
    } catch {
      const samples = fallbackDecode(audioBuffer);
      duration = samples.length / 44100;
      features = extractFeaturesFromSamples(samples, 44100);
    } finally {
      await ctx.close();
    }
  } else {
    const samples = fallbackDecode(audioBuffer);
    duration = samples.length / 44100;
    features = extractFeaturesFromSamples(samples, 44100);
  }

  const hash = await sha256Hash(features.join(","));

  return { hash, features, duration };
}
