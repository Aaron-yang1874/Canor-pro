export type IntentCategory =
  | "violence"
  | "hate"
  | "sexual"
  | "self_harm"
  | "normal"
  | "ambiguous";

export interface IntentResult {
  category: IntentCategory;
  confidence: number;
  subLabels: string[];
}

const INTENT_MAP: Record<string, IntentCategory> = {
  toxic: "violence",
  severe_toxic: "violence",
  obscene: "sexual",
  identity_attack: "hate",
  insult: "hate",
  threat: "violence",
};

const THRESHOLD = 0.5;

export function mapClassificationToIntent(
  labels: { label: string; score: number }[]
): IntentResult {
  const matched: { category: IntentCategory; score: number; subLabel: string }[] = [];

  for (const item of labels) {
    const category = INTENT_MAP[item.label];
    if (category && item.score >= THRESHOLD) {
      matched.push({ category, score: item.score, subLabel: item.label });
    }
  }

  if (matched.length === 0) {
    return {
      category: "normal",
      confidence: 1 - Math.max(...labels.map((l) => l.score), 0),
      subLabels: [],
    };
  }

  matched.sort((a, b) => b.score - a.score);
  const top = matched[0];
  const subLabels = matched
    .filter((m) => m.category === top.category)
    .map((m) => m.subLabel);

  return {
    category: top.category,
    confidence: top.score,
    subLabels: [...new Set(subLabels)],
  };
}
