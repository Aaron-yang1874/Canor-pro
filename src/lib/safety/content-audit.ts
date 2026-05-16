import type { ContentAuditResult, ContentFlag, CopyrightCheckResult } from "@/lib/types";
import { classifyContent, mapClassificationToIntent, resolveContext } from "@/lib/nlp";
import { fingerprintAndCompare } from "@/lib/fingerprint";

const BLOCKED_KEYWORDS = [
  "violence", "hate", "discrimination", "illegal", "explicit",
  "暴力", "仇恨", "歧视", "违法", "色情",
];

export interface PreAuditResult {
  blocked: boolean;
  matchedKeywords: string[];
  reason: string;
}

export interface NlpAuditResult {
  intentCategory: string;
  confidence: number;
  subLabels: string[];
  contextResolved: boolean;
  resolvedCategory: string;
  contextReason: string;
  classifications: { label: string; score: number }[];
}

export function preAudit(content: string): PreAuditResult {
  const lowerContent = content.toLowerCase();
  const matchedKeywords: string[] = [];

  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  return {
    blocked: matchedKeywords.length > 0,
    matchedKeywords,
    reason: matchedKeywords.length > 0
      ? `内容包含违禁关键词: ${matchedKeywords.join(", ")}`
      : "",
  };
}

export async function nlpAudit(content: string): Promise<NlpAuditResult> {
  const classifications = await classifyContent(content);
  const intent = mapClassificationToIntent(classifications);
  const context = resolveContext(content, intent.category);

  return {
    intentCategory: context.resolved ? context.resolvedCategory : intent.category,
    confidence: intent.confidence,
    subLabels: intent.subLabels,
    contextResolved: context.resolved,
    resolvedCategory: context.resolvedCategory,
    contextReason: context.reason,
    classifications,
  };
}

export async function auditContent(content: string): Promise<ContentAuditResult> {
  const flags: ContentFlag[] = [];
  const preResult = preAudit(content);

  if (preResult.blocked) {
    for (const keyword of preResult.matchedKeywords) {
      flags.push({
        category: keyword.includes("版权") || keyword.includes("copyright") ? "copyright" : "hate_speech",
        confidence: 0.9,
        details: `Content contains prohibited keyword: "${keyword}"`,
        action: "block",
      });
    }
  } else {
    const nlpResult = await nlpAudit(content);

    if (nlpResult.intentCategory !== "normal") {
      flags.push({
        category: mapIntentToFlagCategory(nlpResult.intentCategory),
        confidence: nlpResult.confidence,
        details: `NLP检测到${nlpResult.intentCategory}意图，置信度: ${nlpResult.confidence.toFixed(2)}${nlpResult.contextResolved ? `（上下文消歧: ${nlpResult.contextReason}）` : ""}`,
        action: nlpResult.confidence >= 0.8 ? "block" : "warn",
      });
    }
  }

  const hasBlockFlags = flags.some((f) => f.action === "block");
  const hasWarnFlags = flags.some((f) => f.action === "warn");

  let overallRisk: ContentAuditResult["overallRisk"] = "low";
  if (hasBlockFlags) overallRisk = "critical";
  else if (hasWarnFlags) overallRisk = "medium";

  return {
    passed: !hasBlockFlags,
    flags,
    overallRisk,
    auditTimestamp: new Date().toISOString(),
  };
}

function mapIntentToFlagCategory(
  intent: string
): ContentFlag["category"] {
  const mapping: Record<string, ContentFlag["category"]> = {
    violence: "violence",
    hate: "hate_speech",
    sexual: "adult",
    self_harm: "harmful_audio",
  };
  return mapping[intent] ?? "hate_speech";
}

export async function checkCopyright(
  audioBuffer: ArrayBuffer,
  threshold: number = 0.7
): Promise<CopyrightCheckResult> {
  const result = await fingerprintAndCompare(audioBuffer, threshold);
  return {
    isViolation: result.isViolation,
    similarity: result.similarity,
    matchedWorkId: result.matchedWorkId,
  };
}

export async function auditAndCheckCopyright(
  content: string,
  audioBuffer: ArrayBuffer,
  threshold: number = 0.7
): Promise<{ audit: ContentAuditResult; copyright: CopyrightCheckResult }> {
  const audit = await auditContent(content);
  const copyright = await checkCopyright(audioBuffer, threshold);
  return { audit, copyright };
}
