import type {
  ParsedPrompt,
  PromptComponent,
  SystemParams,
  StyleTag,
  FunctionModule,
  QualityParams,
  QualityLevel,
} from "@/lib/types";

const VALID_STYLE_TAGS: Set<string> = new Set([
  "pop", "rock", "jazz", "classical", "electronic",
  "hiphop", "rnb", "folk", "country", "blues",
  "metal", "punk", "reggae", "funk", "soul",
  "latin", "ambient", "lofi", "synthwave", "trap",
  "edm", "house", "techno", "trance", "dubstep",
  "indie", "alternative", "kpop", "jpop", "world",
  "acoustic", "industrial", "gospel", "drum_and_bass",
]);

const VALID_FUNCTION_MODULES: Set<string> = new Set([
  "mixing", "mastering", "multi_track_export",
  "collaboration", "ai_cover", "sound_effects",
  "midi", "stem_separation",
]);

const VALID_QUALITY_LEVELS: Set<string> = new Set([
  "draft", "standard", "high", "master",
]);

const VALID_CONTEXT_DEPTHS: Set<string> = new Set(["shallow", "medium", "deep"]);

export function parsePrompt(raw: string): ParsedPrompt {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const moduleId = extractModuleId(raw);
  const systemParams = extractSystemParams(raw, errors, warnings);
  const styleTags = extractStyleTags(raw, errors, warnings);
  const functionModules = extractFunctionModules(raw, errors, warnings);
  const qualityParams = extractQualityParams(raw, errors, warnings);
  const creativeInstruction = extractCreativeInstruction(raw);

  if (!creativeInstruction || creativeInstruction.trim().length === 0) {
    errors.push("缺少创作指令内容");
  }

  if (styleTags.length === 0) {
    warnings.push("未指定风格标签，建议添加 # 风格标签以提高生成质量");
  }

  if (!systemParams.tempo) {
    suggestions.push("建议添加 @tempo 参数指定速度");
  }

  if (!systemParams.key) {
    suggestions.push("建议添加 @key 参数指定调性");
  }

  if (!qualityParams.quality) {
    suggestions.push("建议添加 %quality 参数指定质量标准");
  }

  const components: PromptComponent = {
    moduleId,
    systemParams,
    styleTags,
    functionModules,
    qualityParams,
    creativeInstruction,
  };

  return {
    isValid: errors.length === 0,
    components,
    errors,
    warnings,
    suggestions,
  };
}

function extractModuleId(raw: string): string {
  const match = raw.match(/【(.+?)】/);
  return match ? match[1].trim() : "未命名模块";
}

function extractSystemParams(
  raw: string,
  errors: string[],
  warnings: string[]
): SystemParams {
  const params: SystemParams = {};

  const paramPatterns: Array<{
    regex: RegExp;
    key: keyof SystemParams;
    parser: (v: string) => unknown;
    validator?: (v: unknown) => boolean;
    errorMsg?: string;
  }> = [
    {
      regex: /@tempo=(\d+)/,
      key: "tempo",
      parser: (v) => parseInt(v, 10),
      validator: (v) => (v as number) >= 20 && (v as number) <= 300,
      errorMsg: "tempo 应在 20-300 之间",
    },
    {
      regex: /@key=([A-G][#b]?m?)/i,
      key: "key",
      parser: (v) => v,
    },
    {
      regex: /@time_signature=(\d+\/\d+)/,
      key: "timeSignature",
      parser: (v) => v,
    },
    {
      regex: /@duration=(\d+)/,
      key: "duration",
      parser: (v) => parseInt(v, 10),
      validator: (v) => (v as number) >= 5 && (v as number) <= 3600,
      errorMsg: "duration 应在 5-3600 秒之间",
    },
    {
      regex: /@bpm=(\d+)/,
      key: "bpm",
      parser: (v) => parseInt(v, 10),
      validator: (v) => (v as number) >= 20 && (v as number) <= 300,
      errorMsg: "bpm 应在 20-300 之间",
    },
    {
      regex: /@context_depth=(shallow|medium|deep)/,
      key: "context_depth",
      parser: (v) => v,
      validator: (v) => VALID_CONTEXT_DEPTHS.has(v as string),
    },
    {
      regex: /@intent_recognition=(enabled|disabled)/,
      key: "intent_recognition",
      parser: (v) => v,
    },
    {
      regex: /@history_window=(\d+)/,
      key: "history_window",
      parser: (v) => parseInt(v, 10),
      validator: (v) => (v as number) >= 1 && (v as number) <= 100,
    },
    {
      regex: /@semantic_matching=(0?\.\d+)/,
      key: "semantic_matching",
      parser: (v) => parseFloat(v),
      validator: (v) => (v as number) >= 0 && (v as number) <= 1,
    },
    {
      regex: /@iteration_count=(\d+)/,
      key: "iteration_count",
      parser: (v) => parseInt(v, 10),
      validator: (v) => (v as number) >= 1 && (v as number) <= 10,
    },
    {
      regex: /@creativity_level=(0?\.\d+)/,
      key: "creativity_level",
      parser: (v) => parseFloat(v),
      validator: (v) => (v as number) >= 0 && (v as number) <= 1,
    },
    {
      regex: /@scale=(\w+)/,
      key: "scale",
      parser: (v) => v,
    },
    {
      regex: /@octave=(\d)/,
      key: "octave",
      parser: (v) => parseInt(v, 10),
      validator: (v) => (v as number) >= 0 && (v as number) <= 8,
    },
  ];

  for (const { regex, key, parser, validator, errorMsg } of paramPatterns) {
    const match = raw.match(regex);
    if (match) {
      const value = parser(match[1]);
      if (validator && !validator(value)) {
        errors.push(errorMsg || `参数 ${key} 值无效: ${match[1]}`);
      } else {
        (params as Record<string, unknown>)[key] = value;
      }
    }
  }

  return params;
}

function extractStyleTags(
  raw: string,
  errors: string[],
  warnings: string[]
): StyleTag[] {
  const tags: StyleTag[] = [];
  const seen = new Set<string>();

  const matches = raw.matchAll(/#(\w+)/g);
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    if (!VALID_STYLE_TAGS.has(tag)) {
      warnings.push(`未知风格标签: #${tag}`);
      continue;
    }
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag as StyleTag);
    }
  }

  return tags;
}

function extractFunctionModules(
  raw: string,
  errors: string[],
  warnings: string[]
): FunctionModule[] {
  const modules: FunctionModule[] = [];
  const seen = new Set<string>();

  const matches = raw.matchAll(/\$(\w+)/g);
  for (const match of matches) {
    const mod = match[1].toLowerCase();
    if (!VALID_FUNCTION_MODULES.has(mod)) {
      warnings.push(`未知功能模块: $${mod}`);
      continue;
    }
    if (!seen.has(mod)) {
      seen.add(mod);
      modules.push(mod as FunctionModule);
    }
  }

  return modules;
}

function extractQualityParams(
  raw: string,
  errors: string[],
  warnings: string[]
): QualityParams {
  const params: QualityParams = {};

  const qualityMatch = raw.match(/%quality=(\w+)/);
  if (qualityMatch) {
    const level = qualityMatch[1].toLowerCase();
    if (VALID_QUALITY_LEVELS.has(level)) {
      params.quality = level as QualityLevel;
    } else {
      errors.push(`无效的质量等级: ${level}`);
    }
  }

  const lufsMatch = raw.match(/%lufs=(-?\d+(?:\.\d+)?)/);
  if (lufsMatch) {
    const lufs = parseFloat(lufsMatch[1]);
    if (lufs >= -70 && lufs <= 0) {
      params.lufs = lufs;
    } else {
      errors.push("LUFS 值应在 -70 到 0 之间");
    }
  }

  const drMatch = raw.match(/%dynamic_range=(\d+(?:\.\d+)?)/);
  if (drMatch) {
    params.dynamic_range = parseFloat(drMatch[1]);
  }

  const swMatch = raw.match(/%stereo_width=(\d+(?:\.\d+)?)/);
  if (swMatch) {
    params.stereo_width = parseFloat(swMatch[1]);
  }

  const clarityMatch = raw.match(/%clarity=(\d+(?:\.\d+)?)/);
  if (clarityMatch) {
    params.clarity = parseFloat(clarityMatch[1]);
  }

  const warmthMatch = raw.match(/%warmth=(\d+(?:\.\d+)?)/);
  if (warmthMatch) {
    params.warmth = parseFloat(warmthMatch[1]);
  }

  return params;
}

function extractCreativeInstruction(raw: string): string {
  const lines = raw.split("\n");
  let foundInstruction = false;
  const instructionLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("创作指令:") || line.trim().startsWith("创作指令：")) {
      foundInstruction = true;
      continue;
    }
    if (foundInstruction) {
      instructionLines.push(line);
    }
  }

  if (instructionLines.length > 0) {
    return instructionLines.join("\n").trim();
  }

  const withoutMarkers = raw
    .replace(/【.*?】/g, "")
    .replace(/@\w+=\S+/g, "")
    .replace(/#\w+/g, "")
    .replace(/\$\w+/g, "")
    .replace(/%\w+=\S+/g, "")
    .trim();

  if (withoutMarkers.length > 0) {
    return withoutMarkers;
  }

  return "";
}