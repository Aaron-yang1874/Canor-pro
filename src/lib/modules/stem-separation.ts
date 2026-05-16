import type { Instrument } from "@/lib/types";

export type StemType = "vocals" | "drums" | "bass" | "piano" | "guitar" | "strings" | "brass" | "synth" | "other";

export interface StemConfig {
  type: StemType;
  label: string;
  priority: number;
  solo: boolean;
  mute: boolean;
}

export interface StemSeparationConfig {
  sourceTrack: string;
  stems: StemConfig[];
  algorithm: "demucs" | "spleeter" | "hybrid";
  quality: "fast" | "balanced" | "high";
  outputFormat: "wav" | "mp3" | "flac";
  normalizeOutput: boolean;
}

const DEFAULT_STEMS: StemConfig[] = [
  { type: "vocals", label: "人声", priority: 1, solo: false, mute: false },
  { type: "drums", label: "鼓组", priority: 2, solo: false, mute: false },
  { type: "bass", label: "贝斯", priority: 3, solo: false, mute: false },
  { type: "other", label: "其他乐器", priority: 4, solo: false, mute: false },
];

const EXTENDED_STEMS: StemConfig[] = [
  { type: "vocals", label: "人声", priority: 1, solo: false, mute: false },
  { type: "drums", label: "鼓组", priority: 2, solo: false, mute: false },
  { type: "bass", label: "贝斯", priority: 3, solo: false, mute: false },
  { type: "piano", label: "钢琴", priority: 4, solo: false, mute: false },
  { type: "guitar", label: "吉他", priority: 5, solo: false, mute: false },
  { type: "strings", label: "弦乐", priority: 6, solo: false, mute: false },
  { type: "brass", label: "铜管", priority: 7, solo: false, mute: false },
  { type: "synth", label: "合成器", priority: 8, solo: false, mute: false },
  { type: "other", label: "其他", priority: 9, solo: false, mute: false },
];

export function createDefaultStemConfig(): StemSeparationConfig {
  return {
    sourceTrack: "",
    stems: DEFAULT_STEMS,
    algorithm: "demucs",
    quality: "balanced",
    outputFormat: "wav",
    normalizeOutput: true,
  };
}

export function createExtendedStemConfig(): StemSeparationConfig {
  return {
    sourceTrack: "",
    stems: EXTENDED_STEMS,
    algorithm: "demucs",
    quality: "high",
    outputFormat: "wav",
    normalizeOutput: true,
  };
}

export function buildStemSeparationPrompt(config: StemSeparationConfig): string {
  const lines: string[] = [
    "【分轨分离】",
    "$stem_separation",
    `%quality=${config.quality}`,
    "",
    `源文件: ${config.sourceTrack}`,
    `分离算法: ${config.algorithm}`,
    `输出格式: ${config.outputFormat.toUpperCase()}`,
    `标准化: ${config.normalizeOutput ? "是" : "否"}`,
    "",
    "分离声部:",
  ];

  for (const stem of config.stems) {
    const active = stem.solo ? "[S]" : stem.mute ? "[M]" : "[A]";
    lines.push(`  ${active} ${stem.label} (${stem.type})`);
  }

  lines.push("");
  lines.push("处理要求:");
  lines.push("1. 确保各声部之间无明显串音");
  lines.push("2. 保持原始音频质量和动态范围");
  lines.push("3. 分离后各声部时长与原文件一致");

  if (config.algorithm === "demucs") {
    lines.push("4. 使用 Demucs 深度学习模型进行高精度分离");
  } else if (config.algorithm === "spleeter") {
    lines.push("4. 使用 Spleeter 模型进行快速分离");
  }

  return lines.join("\n");
}

export function getStemPreset(presetName: string): StemSeparationConfig | null {
  const presets: Record<string, StemSeparationConfig> = {
    basic: createDefaultStemConfig(),
    extended: createExtendedStemConfig(),
    vocals_only: {
      sourceTrack: "",
      stems: [{ type: "vocals", label: "人声", priority: 1, solo: true, mute: false }],
      algorithm: "demucs",
      quality: "high",
      outputFormat: "wav",
      normalizeOutput: true,
    },
    instrumental: {
      sourceTrack: "",
      stems: DEFAULT_STEMS.map((s) =>
        s.type === "vocals" ? { ...s, mute: true } : s
      ),
      algorithm: "demucs",
      quality: "high",
      outputFormat: "wav",
      normalizeOutput: true,
    },
  };

  return presets[presetName] || null;
}

export function getAvailableStems(): StemConfig[] {
  return EXTENDED_STEMS;
}

export function mapStemToInstrument(stem: StemType): Instrument {
  const mapping: Record<StemType, Instrument> = {
    vocals: "vocals",
    drums: "drums",
    bass: "bass",
    piano: "piano",
    guitar: "guitar",
    strings: "strings",
    brass: "brass",
    synth: "synth",
    other: "percussion",
  };

  return mapping[stem] || "percussion";
}