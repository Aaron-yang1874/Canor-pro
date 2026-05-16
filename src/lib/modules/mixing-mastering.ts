import type { MixingPreset, EQSettings, CompressionSettings, ReverbSettings, DelaySettings, StereoSettings, AudioSpec } from "@/lib/types";

const DEFAULT_AUDIO_SPEC: AudioSpec = {
  sampleRate: 44100,
  bitDepth: 24,
  channels: "stereo",
  frequencyResponse: { low: 20, high: 20000 },
  dynamicRange: 96,
  signalToNoiseRatio: 96,
};

export function getAudioSpec(presetId: string): AudioSpec {
  const specMap: Record<string, AudioSpec> = {
    balanced: DEFAULT_AUDIO_SPEC,
    vocal_focused: { ...DEFAULT_AUDIO_SPEC, sampleRate: 48000, dynamicRange: 100 },
    instrumental: { ...DEFAULT_AUDIO_SPEC, sampleRate: 48000, bitDepth: 32, dynamicRange: 108 },
    electronic: { ...DEFAULT_AUDIO_SPEC, sampleRate: 96000, bitDepth: 32, channels: "5.1", dynamicRange: 114, signalToNoiseRatio: 110 },
    acoustic: DEFAULT_AUDIO_SPEC,
  };
  return specMap[presetId] || DEFAULT_AUDIO_SPEC;
}

export function getMixingPreset(presetId: string): MixingPreset | null {
  return MIXING_PRESETS[presetId] || null;
}

export function listMixingPresets(): MixingPreset[] {
  return Object.values(MIXING_PRESETS);
}

export function getPresetsByStyle(style: string): MixingPreset[] {
  return Object.values(MIXING_PRESETS).filter(
    (p) => p.name.toLowerCase().includes(style.toLowerCase())
  );
}

export function buildMixingPrompt(preset: MixingPreset): string {
  const lines: string[] = [
    "【混音母带处理】",
    "$mixing $mastering",
    `%quality=master`,
    `%lufs=-14`,
    "",
    "混音参数配置:",
    `EQ: LowCut=${preset.eq.lowCut}Hz, LowShelf=${preset.eq.lowShelf.freq}Hz(${preset.eq.lowShelf.gain}dB), HighShelf=${preset.eq.highShelf.freq}Hz(${preset.eq.highShelf.gain}dB), HighCut=${preset.eq.highCut}Hz`,
    `Comp: Threshold=${preset.compression.threshold}dB, Ratio=${preset.compression.ratio}:1, Attack=${preset.compression.attack}ms, Release=${preset.compression.release}ms`,
    `Reverb: Type=${preset.reverb.type}, Decay=${preset.reverb.decayTime}s, Mix=${preset.reverb.mix}%`,
    `Delay: Type=${preset.delay.type}, Time=${preset.delay.time}ms, Feedback=${preset.delay.feedback}%`,
    `Stereo: Width=${preset.stereoField.width}%, PanLaw=${preset.stereoField.panLaw}dB`,
    "",
    `母带处理预设: ${preset.name}`,
  ];

  return lines.join("\n");
}

export function createCustomPreset(
  name: string,
  options: Partial<{
    eq: Partial<EQSettings>;
    compression: Partial<CompressionSettings>;
    reverb: Partial<ReverbSettings>;
    delay: Partial<DelaySettings>;
    stereo: Partial<StereoSettings>;
  }>
): MixingPreset {
  const base = MIXING_PRESETS.balanced;

  return {
    id: `custom_${Date.now()}`,
    name,
    eq: { ...base.eq, ...options.eq },
    compression: { ...base.compression, ...options.compression },
    reverb: { ...base.reverb, ...options.reverb },
    delay: { ...base.delay, ...options.delay },
    stereoField: { ...base.stereoField, ...options.stereo },
  };
}

const MIXING_PRESETS: Record<string, MixingPreset> = {
  balanced: {
    id: "balanced",
    name: "平衡混音",
    eq: {
      lowCut: 30,
      lowShelf: { freq: 100, gain: 2 },
      midPeak1: { freq: 500, gain: 0, q: 1.0 },
      midPeak2: { freq: 3000, gain: 1, q: 1.0 },
      highShelf: { freq: 8000, gain: 1 },
      highCut: 18000,
    },
    compression: {
      threshold: -18,
      ratio: 2,
      attack: 10,
      release: 100,
      makeupGain: 2,
      knee: 2,
    },
    reverb: {
      type: "hall",
      decayTime: 1.8,
      preDelay: 20,
      mix: 20,
      size: 50,
      damping: 40,
    },
    delay: {
      type: "digital",
      time: 250,
      feedback: 20,
      mix: 15,
      modulation: 10,
    },
    stereoField: {
      width: 80,
      panLaw: -3,
      midSideBalance: 0,
    },
  },
  vocal_focused: {
    id: "vocal_focused",
    name: "人声突出混音",
    eq: {
      lowCut: 80,
      lowShelf: { freq: 150, gain: -1 },
      midPeak1: { freq: 800, gain: 2, q: 0.8 },
      midPeak2: { freq: 4000, gain: 3, q: 1.2 },
      highShelf: { freq: 10000, gain: 2 },
      highCut: 20000,
    },
    compression: {
      threshold: -20,
      ratio: 3,
      attack: 5,
      release: 80,
      makeupGain: 3,
      knee: 1,
    },
    reverb: {
      type: "plate",
      decayTime: 1.5,
      preDelay: 30,
      mix: 25,
      size: 40,
      damping: 50,
    },
    delay: {
      type: "tape",
      time: 200,
      feedback: 25,
      mix: 18,
      modulation: 15,
    },
    stereoField: {
      width: 70,
      panLaw: -3,
      midSideBalance: 1,
    },
  },
  instrumental: {
    id: "instrumental",
    name: "器乐混音",
    eq: {
      lowCut: 20,
      lowShelf: { freq: 60, gain: 3 },
      midPeak1: { freq: 400, gain: -1, q: 1.5 },
      midPeak2: { freq: 2500, gain: 2, q: 1.0 },
      highShelf: { freq: 12000, gain: 1 },
      highCut: 20000,
    },
    compression: {
      threshold: -16,
      ratio: 2,
      attack: 15,
      release: 120,
      makeupGain: 2,
      knee: 3,
    },
    reverb: {
      type: "hall",
      decayTime: 2.2,
      preDelay: 40,
      mix: 30,
      size: 70,
      damping: 30,
    },
    delay: {
      type: "analog",
      time: 350,
      feedback: 15,
      mix: 10,
      modulation: 20,
    },
    stereoField: {
      width: 100,
      panLaw: -3,
      midSideBalance: -1,
    },
  },
  electronic: {
    id: "electronic",
    name: "电子音乐混音",
    eq: {
      lowCut: 25,
      lowShelf: { freq: 80, gain: 4 },
      midPeak1: { freq: 300, gain: -2, q: 2.0 },
      midPeak2: { freq: 5000, gain: 2, q: 0.7 },
      highShelf: { freq: 10000, gain: 3 },
      highCut: 18000,
    },
    compression: {
      threshold: -14,
      ratio: 4,
      attack: 3,
      release: 50,
      makeupGain: 4,
      knee: 0,
    },
    reverb: {
      type: "shimmer",
      decayTime: 3.0,
      preDelay: 10,
      mix: 35,
      size: 80,
      damping: 20,
    },
    delay: {
      type: "pingpong",
      time: 375,
      feedback: 30,
      mix: 25,
      modulation: 25,
    },
    stereoField: {
      width: 120,
      panLaw: -3,
      midSideBalance: -2,
    },
  },
  acoustic: {
    id: "acoustic",
    name: "原声音乐混音",
    eq: {
      lowCut: 35,
      lowShelf: { freq: 120, gain: 1 },
      midPeak1: { freq: 600, gain: 1, q: 1.0 },
      midPeak2: { freq: 3500, gain: -1, q: 1.5 },
      highShelf: { freq: 9000, gain: 0 },
      highCut: 17000,
    },
    compression: {
      threshold: -22,
      ratio: 1.5,
      attack: 20,
      release: 150,
      makeupGain: 1,
      knee: 4,
    },
    reverb: {
      type: "room",
      decayTime: 1.2,
      preDelay: 15,
      mix: 15,
      size: 30,
      damping: 50,
    },
    delay: {
      type: "analog",
      time: 300,
      feedback: 10,
      mix: 8,
      modulation: 5,
    },
    stereoField: {
      width: 60,
      panLaw: -3,
      midSideBalance: 0,
    },
  },
};