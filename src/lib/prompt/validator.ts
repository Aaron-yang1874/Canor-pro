import type { PromptComponent, ParsedPrompt, SystemParams } from "@/lib/types";

const STYLE_TAG_VALID_VALUES = new Set([
  "pop", "rock", "jazz", "classical", "electronic",
  "hiphop", "rnb", "folk", "country", "blues",
  "metal", "punk", "reggae", "funk", "soul",
  "latin", "ambient", "lofi", "synthwave", "trap",
  "edm", "house", "techno", "trance", "dubstep",
  "indie", "alternative", "kpop", "jpop", "world",
  "acoustic", "industrial", "gospel", "drum_and_bass",
]);

const FUNCTION_MODULE_VALID_VALUES = new Set([
  "mixing", "mastering", "multi_track_export",
  "collaboration", "ai_cover", "sound_effects",
  "midi", "stem_separation",
]);

const QUALITY_LEVEL_VALID_VALUES = new Set(["draft", "standard", "high", "master"]);

const VALID_KEYS = new Set([
  "C", "Cm", "C#", "C#m", "Db", "Dbm",
  "D", "Dm", "D#", "D#m", "Eb", "Ebm",
  "E", "Em", "F", "Fm", "F#", "F#m",
  "Gb", "Gbm", "G", "Gm", "G#", "G#m",
  "Ab", "Abm", "A", "Am", "A#", "A#m",
  "Bb", "Bbm", "B", "Bm",
]);

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateComponents(components: PromptComponent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  validateSystemParams(components.systemParams, errors, warnings, suggestions);
  validateStyleTags(components.styleTags, errors, warnings);
  validateFunctionModules(components.functionModules, errors, warnings);
  validateQualityParams(components.qualityParams, errors, warnings);
  validateCreativeInstruction(components.creativeInstruction, errors, warnings, suggestions);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

function validateSystemParams(
  params: SystemParams,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  if (params.tempo !== undefined) {
    if (params.tempo < 20) errors.push("tempo 不能低于 20 BPM");
    if (params.tempo > 300) errors.push("tempo 不能超过 300 BPM");
  } else {
    suggestions.push("建议设置 @tempo 参数（20-300 BPM）");
  }

  if (params.key !== undefined) {
    if (!VALID_KEYS.has(params.key)) {
      errors.push(`无效的调性: ${params.key}`);
    }
  } else {
    suggestions.push("建议设置 @key 参数");
  }

  if (params.duration !== undefined) {
    if (params.duration < 5) errors.push("duration 不能少于 5 秒");
    if (params.duration > 3600) errors.push("duration 不能超过 3600 秒");
  }

  if (params.creativity_level !== undefined) {
    if (params.creativity_level < 0 || params.creativity_level > 1) {
      errors.push("creativity_level 应在 0.0-1.0 之间");
    }
  }

  if (params.semantic_matching !== undefined) {
    if (params.semantic_matching < 0 || params.semantic_matching > 1) {
      errors.push("semantic_matching 应在 0.0-1.0 之间");
    }
  }

  if (params.history_window !== undefined) {
    if (params.history_window < 1) errors.push("history_window 不能小于 1");
    if (params.history_window > 100) warnings.push("history_window 过大可能影响性能");
  }

  if (params.iteration_count !== undefined) {
    if (params.iteration_count < 1) errors.push("iteration_count 不能小于 1");
    if (params.iteration_count > 10) errors.push("iteration_count 不能超过 10");
  }

  if (params.octave !== undefined) {
    if (params.octave < 0 || params.octave > 8) {
      errors.push("octave 应在 0-8 之间");
    }
  }

  if (params.bpm !== undefined) {
    if (params.bpm < 20 || params.bpm > 300) {
      errors.push("bpm 应在 20-300 之间");
    }
  }

  if (params.scale !== undefined) {
    const validScales = ["major", "minor", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "pentatonic", "blues", "chromatic", "harmonic_minor", "melodic_minor"];
    if (!validScales.includes(params.scale)) {
      warnings.push(`scale 值 "${params.scale}" 不在常见音阶列表中`);
    }
  }

  if (params.intent_recognition !== undefined) {
    if (params.intent_recognition !== "enabled" && params.intent_recognition !== "disabled") {
      errors.push("intent_recognition 应为 enabled 或 disabled");
    }
  }
}

function validateStyleTags(
  tags: string[],
  errors: string[],
  warnings: string[]
): void {
  const validTags = tags.filter((t) => STYLE_TAG_VALID_VALUES.has(t));
  const invalidTags = tags.filter((t) => !STYLE_TAG_VALID_VALUES.has(t));

  for (const tag of invalidTags) {
    errors.push(`无效的风格标签: #${tag}`);
  }

  if (tags.length > 8) {
    warnings.push("风格标签过多（>8），可能导致风格混乱");
  }
}

function validateFunctionModules(
  modules: string[],
  errors: string[],
  warnings: string[]
): void {
  const validModules = modules.filter((m) => FUNCTION_MODULE_VALID_VALUES.has(m));
  const invalidModules = modules.filter((m) => !FUNCTION_MODULE_VALID_VALUES.has(m));

  for (const mod of invalidModules) {
    errors.push(`无效的功能模块: $${mod}`);
  }

  if (modules.length > 6) {
    warnings.push("功能模块过多（>6），建议精简");
  }
}

function validateQualityParams(
  params: { quality?: string; lufs?: number; dynamic_range?: number; stereo_width?: number; clarity?: number; warmth?: number },
  errors: string[],
  warnings: string[]
): void {
  if (params.quality !== undefined) {
    if (!QUALITY_LEVEL_VALID_VALUES.has(params.quality)) {
      errors.push(`无效的质量等级: ${params.quality}`);
    }
  }

  if (params.lufs !== undefined) {
    if (params.lufs < -70) errors.push("LUFS 不能低于 -70");
    if (params.lufs > 0) errors.push("LUFS 不能高于 0");
  }

  if (params.dynamic_range !== undefined) {
    if (params.dynamic_range < 0 || params.dynamic_range > 30) {
      warnings.push("dynamic_range 建议在 0-30 dB 之间");
    }
  }

  if (params.stereo_width !== undefined) {
    if (params.stereo_width < 0 || params.stereo_width > 200) {
      warnings.push("stereo_width 建议在 0-200% 之间");
    }
  }

  if (params.clarity !== undefined) {
    if (params.clarity < 0 || params.clarity > 1) {
      warnings.push("clarity 建议在 0.0-1.0 之间");
    }
  }

  if (params.warmth !== undefined) {
    if (params.warmth < 0 || params.warmth > 1) {
      warnings.push("warmth 建议在 0.0-1.0 之间");
    }
  }
}

function validateCreativeInstruction(
  instruction: string,
  errors: string[],
  warnings: string[],
  suggestions: string[]
): void {
  if (!instruction || instruction.trim().length === 0) {
    errors.push("创作指令不能为空");
    return;
  }

  if (instruction.trim().length < 10) {
    warnings.push("创作指令过短，建议提供更详细的描述");
  }

  if (instruction.trim().length > 2000) {
    warnings.push("创作指令过长（>2000字符），可能超出模型上下文窗口");
  }

  const hasStructure = /intro|verse|chorus|bridge|outro|前奏|主歌|副歌|桥段|尾奏/.test(
    instruction.toLowerCase()
  );
  if (!hasStructure) {
    suggestions.push("建议在创作指令中包含歌曲结构描述");
  }
}

export function validatePromptString(raw: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!raw || raw.trim().length === 0) {
    errors.push("Prompt 不能为空");
    return { valid: false, errors, warnings, suggestions };
  }

  if (raw.trim().length < 20) {
    warnings.push("Prompt 过短，可能不足以生成高质量音乐");
  }

  const hasModuleId = /【.+】/.test(raw);
  if (!hasModuleId) {
    suggestions.push("建议使用【模块标识】指定模块");
  }

  const hasSystemParams = /@\w+=\S+/.test(raw);
  if (!hasSystemParams) {
    suggestions.push("建议添加系统参数（@tempo, @key 等）");
  }

  const hasQualityParams = /%\w+=\S+/.test(raw);
  if (!hasQualityParams) {
    suggestions.push("建议添加质量控制参数（%quality, %lufs 等）");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}