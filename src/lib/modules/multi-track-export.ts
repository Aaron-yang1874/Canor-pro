import type { Instrument } from "@/lib/types";

interface MultiTrackConfig {
  tracks: TrackDefinition[];
  exportFormat: "wav" | "mp3" | "flac" | "aiff" | "ogg";
  bitDepth: 16 | 24 | 32;
  sampleRate: 44100 | 48000 | 96000;
  normalizeStems: boolean;
  includeRawMix: boolean;
}

interface TrackDefinition {
  name: string;
  instrument: Instrument;
  solo: boolean;
  mute: boolean;
  volume: number;
  pan: number;
  fxChain: string[];
}

export function buildMultiTrackPrompt(config: MultiTrackConfig): string {
  const lines: string[] = [
    "【多轨导出】",
    "$multi_track_export",
    `@sample_rate=${config.sampleRate}`,
    `@bit_depth=${config.bitDepth}`,
    "",
    `导出格式: ${config.exportFormat.toUpperCase()}`,
    `标准化分轨: ${config.normalizeStems ? "是" : "否"}`,
    `包含原始混音: ${config.includeRawMix ? "是" : "否"}`,
    "",
    "分轨配置:",
  ];

  for (const track of config.tracks) {
    const status = track.solo ? "[S]" : track.mute ? "[M]" : "[A]";
    lines.push(
      `${status} ${track.name} (${track.instrument}) | Vol:${track.volume} | Pan:${track.pan} | FX:[${track.fxChain.join(", ")}]`
    );
  }

  return lines.join("\n");
}

export function createDefaultMultiTrackConfig(): MultiTrackConfig {
  return {
    tracks: [
      {
        name: "主旋律",
        instrument: "piano",
        solo: false,
        mute: false,
        volume: 0,
        pan: 0,
        fxChain: ["reverb", "eq"],
      },
      {
        name: "节奏吉他",
        instrument: "guitar",
        solo: false,
        mute: false,
        volume: -3,
        pan: -20,
        fxChain: ["compressor", "eq"],
      },
      {
        name: "贝斯",
        instrument: "bass",
        solo: false,
        mute: false,
        volume: -2,
        pan: 0,
        fxChain: ["compressor", "saturation"],
      },
      {
        name: "鼓组",
        instrument: "drums",
        solo: false,
        mute: false,
        volume: -1,
        pan: 0,
        fxChain: ["compressor", "transient_shaper"],
      },
      {
        name: "合成器",
        instrument: "synth",
        solo: false,
        mute: false,
        volume: -5,
        pan: 30,
        fxChain: ["reverb", "delay", "chorus"],
      },
    ],
    exportFormat: "wav",
    bitDepth: 24,
    sampleRate: 48000,
    normalizeStems: true,
    includeRawMix: true,
  };
}

export function getTrackTemplate(style: string): MultiTrackConfig {
  const templates: Record<string, MultiTrackConfig> = {
    rock: {
      tracks: [
        { name: "主音吉他", instrument: "guitar", solo: false, mute: false, volume: 0, pan: -15, fxChain: ["distortion", "eq", "reverb"] },
        { name: "节奏吉他", instrument: "guitar", solo: false, mute: false, volume: -3, pan: 15, fxChain: ["overdrive", "eq"] },
        { name: "贝斯", instrument: "bass", solo: false, mute: false, volume: -1, pan: 0, fxChain: ["compressor", "eq"] },
        { name: "架子鼓", instrument: "drums", solo: false, mute: false, volume: 0, pan: 0, fxChain: ["compressor", "reverb"] },
        { name: "人声", instrument: "vocals", solo: false, mute: false, volume: 2, pan: 0, fxChain: ["compressor", "eq", "reverb", "delay"] },
      ],
      exportFormat: "wav", bitDepth: 24, sampleRate: 48000, normalizeStems: true, includeRawMix: true,
    },
    electronic: {
      tracks: [
        { name: "Kick", instrument: "drums", solo: false, mute: false, volume: 0, pan: 0, fxChain: ["compressor", "eq"] },
        { name: "Snare/Clap", instrument: "drums", solo: false, mute: false, volume: -2, pan: 0, fxChain: ["reverb", "eq"] },
        { name: "Hi-hats", instrument: "drums", solo: false, mute: false, volume: -6, pan: 20, fxChain: ["eq"] },
        { name: "Bass Synth", instrument: "synth", solo: false, mute: false, volume: -1, pan: 0, fxChain: ["compressor", "saturation"] },
        { name: "Lead Synth", instrument: "synth", solo: false, mute: false, volume: -3, pan: -10, fxChain: ["reverb", "delay", "chorus"] },
        { name: "Pad", instrument: "synth", solo: false, mute: false, volume: -5, pan: 30, fxChain: ["reverb", "filter"] },
      ],
      exportFormat: "wav", bitDepth: 24, sampleRate: 48000, normalizeStems: true, includeRawMix: true,
    },
    orchestral: {
      tracks: [
        { name: "第一小提琴", instrument: "violin", solo: false, mute: false, volume: 0, pan: -40, fxChain: ["reverb", "eq"] },
        { name: "第二小提琴", instrument: "violin", solo: false, mute: false, volume: -2, pan: -20, fxChain: ["reverb", "eq"] },
        { name: "中提琴", instrument: "strings", solo: false, mute: false, volume: -1, pan: 0, fxChain: ["reverb", "eq"] },
        { name: "大提琴", instrument: "cello", solo: false, mute: false, volume: 0, pan: 20, fxChain: ["reverb", "eq"] },
        { name: "铜管", instrument: "brass", solo: false, mute: false, volume: -2, pan: 0, fxChain: ["reverb", "compressor"] },
        { name: "木管", instrument: "woodwinds", solo: false, mute: false, volume: -3, pan: 10, fxChain: ["reverb"] },
        { name: "定音鼓", instrument: "percussion", solo: false, mute: false, volume: -1, pan: 0, fxChain: ["compressor", "reverb"] },
      ],
      exportFormat: "wav", bitDepth: 24, sampleRate: 96000, normalizeStems: true, includeRawMix: true,
    },
  };

  return templates[style] || createDefaultMultiTrackConfig();
}