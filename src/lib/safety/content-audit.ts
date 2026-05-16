import type { ContentAuditResult, ContentFlag, CopyrightCheckResult } from "@/lib/types";

const BLOCKED_KEYWORDS = [
  "violence", "hate", "discrimination", "illegal", "explicit",
  "暴力", "仇恨", "歧视", "违法", "色情",
];

export function auditContent(content: string): ContentAuditResult {
  const flags: ContentFlag[] = [];
  const lowerContent = content.toLowerCase();

  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      flags.push({
        category: keyword.includes("版权") || keyword.includes("copyright") ? "copyright" : "hate_speech",
        confidence: 0.9,
        details: `Content contains prohibited keyword: "${keyword}"`,
        action: "block",
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

export function checkCopyright(
  generatedAudio: string,
  referenceFingerprints: string[]
): CopyrightCheckResult {
  const similarityScore = computeSimilarity(generatedAudio, referenceFingerprints);
  const THRESHOLD = 0.7;

  return {
    similarityScore,
    matchedWork: similarityScore >= THRESHOLD ? "Unknown Reference Track" : undefined,
    matchedArtist: similarityScore >= THRESHOLD ? "Unknown Artist" : undefined,
    isBlocked: similarityScore >= THRESHOLD,
    threshold: THRESHOLD,
    fingerprintMatch: similarityScore >= THRESHOLD,
  };
}

export function auditAndCheckCopyright(
  content: string,
  generatedAudio: string,
  referenceFingerprints: string[] = []
): { audit: ContentAuditResult; copyright: CopyrightCheckResult } {
  const audit = auditContent(content);
  const copyright = checkCopyright(generatedAudio, referenceFingerprints);
  return { audit, copyright };
}

function computeSimilarity(audio: string, fingerprints: string[]): number {
  if (fingerprints.length === 0) return 0;
  const audioHash = simpleHash(audio.slice(0, 200));
  const scores = fingerprints.map((fp) => {
    const fpH = simpleHash(fp.slice(0, 100));
    const diff = Math.abs(audioHash - fpH) / Math.max(audioHash, fpH, 1);
    return 1 - Math.min(diff, 1);
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}