export interface ContextResult {
  resolved: boolean;
  originalCategory: string;
  resolvedCategory: string;
  reason: string;
}

interface ContextPattern {
  pattern: RegExp;
  resolvedCategory: string;
  reason: string;
}

const CONTEXT_PATTERNS: ContextPattern[] = [
  { pattern: /杀青/, resolvedCategory: "normal", reason: "影视术语" },
  { pattern: /杀手锏/, resolvedCategory: "normal", reason: "习语" },
  { pattern: /打击乐/, resolvedCategory: "normal", reason: "音乐术语" },
  { pattern: /爆炸性/, resolvedCategory: "normal", reason: "热情表达" },
  { pattern: /疯狂/, resolvedCategory: "normal", reason: "热情表达" },
];

export function resolveContext(
  text: string,
  detectedCategory: string
): ContextResult {
  for (const cp of CONTEXT_PATTERNS) {
    if (cp.pattern.test(text)) {
      return {
        resolved: true,
        originalCategory: detectedCategory,
        resolvedCategory: cp.resolvedCategory,
        reason: cp.reason,
      };
    }
  }

  return {
    resolved: false,
    originalCategory: detectedCategory,
    resolvedCategory: detectedCategory,
    reason: "无匹配消歧规则",
  };
}
