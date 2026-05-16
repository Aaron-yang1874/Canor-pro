import type {
  BuiltPrompt,
  PromptComponent,
  SystemParams,
  StyleTag,
  FunctionModule,
  QualityParams,
  QualityLevel,
  GenerationMetrics,
  CreationRequest,
  ModalityType,
  MultimodalInput,
  EvolutionConfig,
  FederatedConfig,
} from "@/lib/types";

interface BuildInput {
  moduleId?: string;
  systemParams?: Partial<SystemParams> & { hasVocals?: boolean };
  styleTags?: StyleTag[];
  functionModules?: FunctionModule[];
  qualityParams?: Partial<QualityParams>;
  creativeInstruction: string;
  modality?: ModalityType;
  multimodalInput?: MultimodalInput;
  evolution?: EvolutionConfig;
  federated?: FederatedConfig;
}

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

export function buildPrompt(input: BuildInput): BuiltPrompt {
  const {
    moduleId = "音乐创作",
    systemParams = {},
    styleTags = [],
    functionModules = [],
    qualityParams = {},
    creativeInstruction,
  } = input;

  const { hasVocals, ...restSystemParams } = systemParams;

  const defaultSystemParams: SystemParams = {
    tempo: 120,
    key: "C",
    timeSignature: "4/4",
    context_depth: "deep",
    intent_recognition: "enabled",
    history_window: 10,
    semantic_matching: 0.85,
    creativity_level: 0.75,
  };

  const mergedSystemParams: SystemParams = {
    ...defaultSystemParams,
    ...restSystemParams,
  };

  const defaultQualityParams: QualityParams = {
    quality: "standard",
    lufs: -14,
  };

  const mergedQualityParams: QualityParams = {
    ...defaultQualityParams,
    ...qualityParams,
  };

  const validStyles = styleTags.filter((s) =>
    VALID_STYLE_TAGS.has(s)
  ) as StyleTag[];

  const validModules = functionModules.filter((m) =>
    VALID_FUNCTION_MODULES.has(m)
  ) as FunctionModule[];

  const components: PromptComponent = {
    moduleId,
    systemParams: mergedSystemParams,
    styleTags: validStyles,
    functionModules: validModules,
    qualityParams: mergedQualityParams,
    creativeInstruction,
  };

  const raw = serializePrompt(components, hasVocals);
  const tokenCount = estimateTokens(raw);

  const generationMetrics: GenerationMetrics = {
    durationSeconds: mergedSystemParams.duration || 180,
    generationTimeMs: 0,
    iterationsUsed: 0,
    qualityScore: 0,
    creativityScore: mergedSystemParams.creativity_level || 0.75,
    modelVersion: "2.0.0",
  };

  return {
    raw,
    components,
    metadata: {
      tokenCount,
      complexity: assessComplexity(components),
      estimatedDuration: mergedSystemParams.duration || 180,
      createdAt: new Date().toISOString(),
      version: "2.0.0",
    },
  };
}

function serializePrompt(components: PromptComponent, hasVocals?: boolean): string {
  const lines: string[] = [];

  lines.push(`【${components.moduleId}】`);

  const { systemParams } = components;
  if (systemParams.tempo) lines.push(`@tempo=${systemParams.tempo}`);
  if (systemParams.key) lines.push(`@key=${systemParams.key}`);
  if (systemParams.timeSignature) lines.push(`@time_signature=${systemParams.timeSignature}`);
  if (systemParams.duration) lines.push(`@duration=${systemParams.duration}`);
  if (systemParams.bpm) lines.push(`@bpm=${systemParams.bpm}`);
  if (systemParams.scale) lines.push(`@scale=${systemParams.scale}`);
  if (systemParams.octave !== undefined) lines.push(`@octave=${systemParams.octave}`);
  if (systemParams.context_depth) lines.push(`@context_depth=${systemParams.context_depth}`);
  if (systemParams.intent_recognition) lines.push(`@intent_recognition=${systemParams.intent_recognition}`);
  if (systemParams.history_window) lines.push(`@history_window=${systemParams.history_window}`);
  if (systemParams.semantic_matching) lines.push(`@semantic_matching=${systemParams.semantic_matching}`);
  if (systemParams.iteration_count) lines.push(`@iteration_count=${systemParams.iteration_count}`);
  if (systemParams.creativity_level) lines.push(`@creativity_level=${systemParams.creativity_level}`);
  if (hasVocals !== undefined) lines.push(`@has_vocals=${hasVocals}`);

  if (components.styleTags.length > 0) {
    lines.push(components.styleTags.map((s) => `#${s}`).join(" "));
  }

  if (components.functionModules.length > 0) {
    lines.push(components.functionModules.map((m) => `$${m}`).join(" "));
  }

  const { qualityParams } = components;
  const qualityLines: string[] = [];
  if (qualityParams.quality) qualityLines.push(`%quality=${qualityParams.quality}`);
  if (qualityParams.lufs !== undefined) qualityLines.push(`%lufs=${qualityParams.lufs}`);
  if (qualityParams.dynamic_range !== undefined) qualityLines.push(`%dynamic_range=${qualityParams.dynamic_range}`);
  if (qualityParams.stereo_width !== undefined) qualityLines.push(`%stereo_width=${qualityParams.stereo_width}`);
  if (qualityParams.clarity !== undefined) qualityLines.push(`%clarity=${qualityParams.clarity}`);
  if (qualityParams.warmth !== undefined) qualityLines.push(`%warmth=${qualityParams.warmth}`);
  if (qualityLines.length > 0) {
    lines.push(qualityLines.join(" "));
  }

  if (components.creativeInstruction) {
    lines.push("");
    lines.push("创作指令:");
    lines.push(components.creativeInstruction);
  }

  return lines.join("\n");
}

function estimateTokens(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  const special = (text.match(/[@#$%=【】\-\n]/g) || []).length;

  return Math.ceil(chineseChars * 1.5 + englishWords * 0.75 + numbers * 0.5 + special * 0.3);
}

function assessComplexity(components: PromptComponent): "simple" | "moderate" | "complex" {
  let score = 0;

  const paramCount = Object.values(components.systemParams).filter((v) => v !== undefined).length;
  score += paramCount * 1;
  score += components.styleTags.length * 2;
  score += components.functionModules.length * 2;

  if (components.qualityParams.quality === "high" || components.qualityParams.quality === "master") {
    score += 2;
  }

  if (components.creativeInstruction.length > 200) {
    score += 2;
  }

  if (score <= 6) return "simple";
  if (score <= 12) return "moderate";
  return "complex";
}

export function buildQuickPrompt(
  style: StyleTag,
  emotion: string,
  description: string
): BuiltPrompt {
  return buildPrompt({
    moduleId: "快速音乐创作",
    systemParams: {
      tempo: getDefaultTempo(style),
      context_depth: "medium",
    },
    styleTags: [style],
    qualityParams: { quality: "standard" },
    creativeInstruction: `创作一首${emotion}风格的${style}音乐。${description}`,
  });
}

function getDefaultTempo(style: StyleTag): number {
  const tempos: Partial<Record<StyleTag, number>> = {
    pop: 120, rock: 140, jazz: 100, classical: 80, electronic: 128,
    hiphop: 90, rnb: 85, folk: 100, metal: 160, punk: 180,
    lofi: 75, ambient: 60, edm: 128, house: 125, trap: 140,
    synthwave: 110, funk: 110, soul: 90, reggae: 75, blues: 80,
  };
  return tempos[style] ?? 120;
}

export function buildFromCreationRequest(request: CreationRequest): BuiltPrompt {
  return buildPrompt({
    moduleId: "音乐创作",
    systemParams: {
      tempo: request.parameters.tempo,
      duration: request.parameters.duration,
      context_depth: request.advanced.contextDepth,
      creativity_level: request.advanced.creativityLevel,
      iteration_count: request.advanced.iterationCount,
      hasVocals: request.parameters.hasVocals,
    },
    styleTags: [request.parameters.genre as StyleTag],
    qualityParams: { quality: request.parameters.quality },
    creativeInstruction: request.prompt,
    modality: request.modality,
    multimodalInput: request.multimodalInput,
    evolution: request.evolution,
    federated: request.federated,
  });
}