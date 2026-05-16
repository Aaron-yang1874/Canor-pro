import type { QualityAssessment, BuiltPrompt, QualityLevel } from "@/lib/types";

interface QualityInput {
  prompt: string;
  targetQuality: QualityLevel;
  styleTags: string[];
  emotionIntensity: number;
}

const QUALITY_THRESHOLDS: Record<QualityLevel, number> = {
  draft: 0.3,
  standard: 0.5,
  high: 0.7,
  master: 0.9,
};

const QUALITY_WEIGHTS = {
  coherence: 0.25,
  creativity: 0.2,
  technicalQuality: 0.25,
  emotionalImpact: 0.15,
  structuralIntegrity: 0.15,
};

export function assessQuality(input: QualityInput): QualityAssessment {
  const { prompt, targetQuality, styleTags, emotionIntensity } = input;

  const coherence = evaluateCoherence(prompt);
  const creativity = evaluateCreativity(prompt, styleTags);
  const technicalQuality = evaluateTechnicalQuality(prompt);
  const emotionalImpact = evaluateEmotionalImpact(prompt, emotionIntensity);
  const structuralIntegrity = evaluateStructuralIntegrity(prompt);

  const overallScore =
    coherence * QUALITY_WEIGHTS.coherence +
    creativity * QUALITY_WEIGHTS.creativity +
    technicalQuality * QUALITY_WEIGHTS.technicalQuality +
    emotionalImpact * QUALITY_WEIGHTS.emotionalImpact +
    structuralIntegrity * QUALITY_WEIGHTS.structuralIntegrity;

  const threshold = QUALITY_THRESHOLDS[targetQuality];
  const suggestions = generateSuggestions({
    coherence,
    creativity,
    technicalQuality,
    emotionalImpact,
    structuralIntegrity,
  });

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    dimensions: {
      coherence: Math.round(coherence * 100) / 100,
      creativity: Math.round(creativity * 100) / 100,
      technicalQuality: Math.round(technicalQuality * 100) / 100,
      emotionalImpact: Math.round(emotionalImpact * 100) / 100,
      structuralIntegrity: Math.round(structuralIntegrity * 100) / 100,
    },
    suggestions,
    meetsThreshold: overallScore >= threshold,
  };
}

function evaluateCoherence(prompt: string): number {
  let score = 0.5;

  if (prompt.includes("@")) score += 0.1;
  if (prompt.includes("#")) score += 0.05;
  if (prompt.includes("$")) score += 0.05;
  if (prompt.includes("%")) score += 0.05;

  const hasStructure = /【.*】/.test(prompt);
  if (hasStructure) score += 0.1;

  const hasParameters = /@\w+=\S+/.test(prompt);
  if (hasParameters) score += 0.1;

  const hasQuality = /%quality=\w+/.test(prompt);
  if (hasQuality) score += 0.05;

  return Math.min(score, 1.0);
}

function evaluateCreativity(prompt: string, styleTags: string[]): number {
  let score = 0.5;

  if (styleTags.length >= 2) score += 0.1;
  if (styleTags.length >= 4) score += 0.1;

  const hasUniqueCombination = styleTags.length >= 3 &&
    styleTags.some((s) => ["classical", "jazz", "world"].includes(s)) &&
    styleTags.some((s) => ["electronic", "trap", "edm"].includes(s));
  if (hasUniqueCombination) score += 0.15;

  const hasDetailedInstruction = prompt.length > 200;
  if (hasDetailedInstruction) score += 0.1;

  const hasIteration = prompt.includes("迭代") || prompt.includes("iteration");
  if (hasIteration) score += 0.05;

  return Math.min(score, 1.0);
}

function evaluateTechnicalQuality(prompt: string): number {
  let score = 0.5;

  const hasTempo = /@tempo=\d+/.test(prompt) || /@bpm=\d+/.test(prompt);
  if (hasTempo) score += 0.1;

  const hasKey = /@key=\w+/.test(prompt);
  if (hasKey) score += 0.1;

  const hasTimeSignature = /@time_signature=\S+/.test(prompt);
  if (hasTimeSignature) score += 0.05;

  const hasDuration = /@duration=\d+/.test(prompt);
  if (hasDuration) score += 0.05;

  const hasLUFS = /%lufs=-\d+/.test(prompt);
  if (hasLUFS) score += 0.1;

  const hasMixing = /\$mixing/.test(prompt) || /\$mastering/.test(prompt);
  if (hasMixing) score += 0.1;

  return Math.min(score, 1.0);
}

function evaluateEmotionalImpact(prompt: string, intensity: number): number {
  let score = 0.4 + intensity * 0.3;

  const hasEmotionKeywords = /情感|情绪|emotion|mood|氛围|atmosphere/.test(prompt);
  if (hasEmotionKeywords) score += 0.1;

  const hasDetailedEmotion = /【情感分析】/.test(prompt);
  if (hasDetailedEmotion) score += 0.1;

  const hasDynamicContrast = /强弱|对比|dynamics|contrast/.test(prompt);
  if (hasDynamicContrast) score += 0.05;

  return Math.min(score, 1.0);
}

function evaluateStructuralIntegrity(prompt: string): number {
  let score = 0.5;

  const hasStructure = /结构|structure|intro|verse|chorus|bridge|outro/.test(prompt);
  if (hasStructure) score += 0.15;

  const hasSections = (prompt.match(/【/g) || []).length >= 2;
  if (hasSections) score += 0.1;

  const isWellFormed = prompt.trim().length > 50 && !prompt.includes("undefined");
  if (isWellFormed) score += 0.1;

  const hasInstrumentation = /乐器|instrument|钢琴|吉他|鼓|贝斯/.test(prompt);
  if (hasInstrumentation) score += 0.1;

  const hasEndMarker = prompt.trim().endsWith("】") || prompt.includes("结束") || prompt.includes("end");
  if (hasEndMarker) score += 0.05;

  return Math.min(score, 1.0);
}

function generateSuggestions(dimensions: QualityAssessment["dimensions"]): string[] {
  const suggestions: string[] = [];

  if (dimensions.coherence < 0.6) {
    suggestions.push("建议添加系统参数(@tempo, @key)提高 Prompt 结构一致性");
  }
  if (dimensions.creativity < 0.5) {
    suggestions.push("建议混合更多风格标签(#)以增强创意性");
  }
  if (dimensions.technicalQuality < 0.6) {
    suggestions.push("建议添加技术参数(%lufs, @duration)和质量控制(%quality)");
  }
  if (dimensions.emotionalImpact < 0.5) {
    suggestions.push("建议明确情感关键词和氛围描述以增强情感表达");
  }
  if (dimensions.structuralIntegrity < 0.6) {
    suggestions.push("建议添加歌曲结构描述(intro/verse/chorus/bridge/outro)");
  }

  if (suggestions.length === 0) {
    suggestions.push("Prompt 质量良好，可尝试迭代优化进一步提升");
  }

  return suggestions;
}

export function quickQualityCheck(prompt: string): {
  score: number;
  level: QualityLevel;
} {
  const score = evaluateCoherence(prompt) * 0.3 +
    evaluateTechnicalQuality(prompt) * 0.3 +
    evaluateStructuralIntegrity(prompt) * 0.4;

  let level: QualityLevel = "draft";
  if (score >= 0.9) level = "master";
  else if (score >= 0.7) level = "high";
  else if (score >= 0.5) level = "standard";

  return { score: Math.round(score * 100) / 100, level };
}