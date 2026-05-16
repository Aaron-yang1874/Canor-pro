import type { SelfRepairResult, DefectDiagnosis, QualityDimension } from "@/lib/types";

const QUALITY_THRESHOLD = 0.85;
const QUALITY_DIMENSIONS: QualityDimension[] = [
  "coherence", "creativity", "technical_quality", "emotional_impact",
  "structural_integrity", "harmony", "rhythm", "timbre",
  "dynamics", "spatial_quality", "originality", "production_quality",
];

export function multiDimensionEvaluation(_generation: unknown): Record<QualityDimension, number> {
  const scores: Record<string, number> = {};
  for (const dim of QUALITY_DIMENSIONS) {
    const baseScore = 0.55 + Math.random() * 0.4;
    scores[dim] = Math.min(1, baseScore);
  }
  return scores as Record<QualityDimension, number>;
}

export function weightedSum(scores: Record<QualityDimension, number>): number {
  const weights: Record<QualityDimension, number> = {
    coherence: 0.12, creativity: 0.12, technical_quality: 0.10,
    emotional_impact: 0.10, structural_integrity: 0.08, harmony: 0.08,
    rhythm: 0.08, timbre: 0.08, dynamics: 0.06, spatial_quality: 0.06,
    originality: 0.06, production_quality: 0.06,
  };
  let total = 0;
  for (const dim of QUALITY_DIMENSIONS) {
    total += (scores[dim] || 0) * (weights[dim] || 0);
  }
  return total;
}

export function diagnoseDefects(scores: Record<QualityDimension, number>): DefectDiagnosis[] {
  const defects: DefectDiagnosis[] = [];
  for (const dim of QUALITY_DIMENSIONS) {
    const score = scores[dim] || 0;
    if (score < 0.5) {
      defects.push({ dimension: dim, severity: "critical", description: `${dim} score critically low (${score.toFixed(2)})`, suggestedFix: `Regenerate ${dim} from scratch with adjusted parameters` });
    } else if (score < 0.7) {
      defects.push({ dimension: dim, severity: "major", description: `${dim} score below threshold (${score.toFixed(2)})`, suggestedFix: `Apply local repair to ${dim} component` });
    } else if (score < 0.85) {
      defects.push({ dimension: dim, severity: "minor", description: `${dim} could be improved (${score.toFixed(2)})`, suggestedFix: `Fine-tune ${dim} parameters` });
    }
  }
  return defects.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function determineRepairStrategy(defects: DefectDiagnosis[]): "regenerate" | "local_repair" | "fine_tune" {
  if (defects.length === 0) return "fine_tune";
  const hasCritical = defects.some((d) => d.severity === "critical");
  if (hasCritical) return "regenerate";
  const hasMajor = defects.some((d) => d.severity === "major");
  if (hasMajor) return "local_repair";
  return "fine_tune";
}

export function selfCognitionAndRepair(generation: unknown, maxIterations: number = 5): SelfRepairResult {
  let currentWork = generation;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations = i + 1;
    const qualityScores = multiDimensionEvaluation(currentWork);
    const overallScore = weightedSum(qualityScores);

    if (overallScore >= QUALITY_THRESHOLD) {
      return {
        originalScore: overallScore,
        repairedScore: overallScore,
        defects: [],
        repairStrategy: "fine_tune",
        iterations,
        converged: true,
      };
    }

    const defects = diagnoseDefects(qualityScores);
    const strategy = determineRepairStrategy(defects);

    if (strategy === "regenerate") {
      currentWork = regenerateWithConstraints(defects);
    } else if (strategy === "local_repair") {
      currentWork = localRepair(currentWork, defects);
    } else {
      currentWork = fineTuneParameters(currentWork, defects);
    }
  }

  const finalScores = multiDimensionEvaluation(currentWork);
  const finalOverall = weightedSum(finalScores);
  const finalDefects = diagnoseDefects(finalScores);

  return {
    originalScore: weightedSum(multiDimensionEvaluation(generation)),
    repairedScore: finalOverall,
    defects: finalDefects,
    repairStrategy: determineRepairStrategy(finalDefects),
    iterations,
    converged: finalOverall >= QUALITY_THRESHOLD,
  };
}

function regenerateWithConstraints(defects: DefectDiagnosis[]): unknown {
  const constraints = defects.filter((d) => d.severity === "critical").map((d) => d.dimension);
  return { regenerated: true, constraints, quality: 0.7 + Math.random() * 0.2 };
}

function localRepair(work: unknown, defects: DefectDiagnosis[]): unknown {
  const repairs = defects.filter((d) => d.severity === "major").map((d) => d.dimension);
  return { ...(work as object), repaired: true, repairs, quality: 0.75 + Math.random() * 0.15 };
}

function fineTuneParameters(work: unknown, defects: DefectDiagnosis[]): unknown {
  const adjustments = defects.filter((d) => d.severity === "minor").map((d) => d.dimension);
  return { ...(work as object), fineTuned: true, adjustments, quality: 0.82 + Math.random() * 0.1 };
}