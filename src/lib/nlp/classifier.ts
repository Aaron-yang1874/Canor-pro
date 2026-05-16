export interface ClassificationResult {
  label: string;
  score: number;
}

const MOCK_KEYWORDS: Record<string, string> = {
  "violence": "toxic",
  "hate": "identity_attack",
  "sexual": "obscene",
};

export async function classifyContent(
  text: string
): Promise<ClassificationResult[]> {
  try {
    const { pipeline } = await import("@xenova/transformers");
    const classifier = await pipeline(
      "text-classification",
      "unitary/toxic-bert",
      { quantized: true }
    );
    const classifierFn = classifier as (text: string, options?: Record<string, unknown>) => Promise<unknown[]>;
    const results = await classifierFn(text);
    const safeResults = (results as Array<Record<string, unknown>>).slice(0, 6);
    return safeResults.map((r) => ({
      label: String(r.label ?? ""),
      score: Number(r.score ?? 0),
    }));
  } catch {
    const words = text.toLowerCase().split(/\s+/);
    const scoreMap: Record<string, number> = {};
    const toxicWords = ["hate", "kill", "violent", "abuse", "attack", "threat", "toxic"];
    
    for (const word of toxicWords) {
      if (words.some(w => w.includes(word))) {
        const category = MOCK_KEYWORDS[word] || "toxic";
        scoreMap[category] = (scoreMap[category] || 0) + 0.5;
      }
    }
    
    return Object.entries(scoreMap).map(([label, score]) => ({
      label,
      score: Math.min(score, 1),
    }));
  }
}
