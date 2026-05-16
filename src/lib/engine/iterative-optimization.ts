import type { IterationRecord, QualityAssessment, BuiltPrompt } from "@/lib/types";

interface IterationInput {
  originalPrompt: string;
  feedback: string;
  currentIteration: number;
  maxIterations?: number;
}

interface IterationOutput {
  record: IterationRecord;
  optimizedPrompt: string;
  shouldContinue: boolean;
}

export function performIteration(input: IterationInput): IterationOutput {
  const { originalPrompt, feedback, currentIteration, maxIterations = 5 } = input;

  const improvements = analyzeFeedback(feedback);
  const optimizedPrompt = applyImprovements(originalPrompt, improvements);
  const qualityDelta = calculateQualityDelta(originalPrompt, optimizedPrompt);

  const record: IterationRecord = {
    iterationNumber: currentIteration + 1,
    prompt: optimizedPrompt,
    feedback,
    improvements,
    qualityDelta,
  };

  const shouldContinue = currentIteration + 1 < maxIterations && qualityDelta > 0.01;

  return {
    record,
    optimizedPrompt,
    shouldContinue,
  };
}

function analyzeFeedback(feedback: string): string[] {
  const improvements: string[] = [];
  const lower = feedback.toLowerCase();

  const feedbackPatterns: Array<{ pattern: RegExp; improvement: string }> = [
    { pattern: /节奏|tempo|bpm|速度/, improvement: "调整 @tempo 参数" },
    { pattern: /调性|key|转调/, improvement: "修改 @key 调性设置" },
    { pattern: /风格|style|genre/, improvement: "调整 # 风格标签组合" },
    { pattern: /情感|情绪|氛围|mood/, improvement: "优化情感参数和氛围描述" },
    { pattern: /质量|quality|清晰/, improvement: "提升 %quality 质量等级" },
    { pattern: /结构|structure|段落/, improvement: "完善歌曲结构描述" },
    { pattern: /音量|loudness|lufs/, improvement: "调整 %lufs 响度标准" },
    { pattern: /乐器|instrument|编排/, improvement: "细化乐器编排和音色描述" },
    { pattern: /混音|mixing|混响|reverb/, improvement: "增强 $mixing 混音参数" },
    { pattern: /时长|duration|长度/, improvement: "设置 @duration 时长参数" },
    { pattern: /和弦|chord|和声|harmony/, improvement: "明确和弦进行与和声编排" },
    { pattern: /创意|creativity|创新/, improvement: "增加创意元素和独特风格融合" },
  ];

  for (const { pattern, improvement } of feedbackPatterns) {
    if (pattern.test(lower)) {
      improvements.push(improvement);
    }
  }

  if (improvements.length === 0) {
    improvements.push("根据反馈进行微调优化");
  }

  return improvements;
}

function applyImprovements(prompt: string, improvements: string[]): string {
  let optimized = prompt;

  for (const improvement of improvements) {
    if (improvement.includes("@tempo") && !optimized.includes("@tempo=")) {
      optimized += "\n@tempo=120";
    }
    if (improvement.includes("@key") && !optimized.includes("@key=")) {
      optimized += "\n@key=C";
    }
    if (improvement.includes("%quality") && !optimized.includes("%quality=")) {
      optimized += "\n%quality=high";
    }
    if (improvement.includes("%lufs") && !optimized.includes("%lufs=")) {
      optimized += "\n%lufs=-14";
    }
    if (improvement.includes("结构") && !optimized.includes("structure")) {
      optimized += "\n结构: intro-verse-chorus-verse-chorus-bridge-chorus-outro";
    }
    if (improvement.includes("@duration") && !optimized.includes("@duration=")) {
      optimized += "\n@duration=180";
    }
    if (improvement.includes("$mixing") && !optimized.includes("$mixing")) {
      optimized += "\n$mixing $mastering";
    }
  }

  return optimized;
}

function calculateQualityDelta(original: string, optimized: string): number {
  const originalParams = countParameters(original);
  const optimizedParams = countParameters(optimized);
  const addedParams = optimizedParams - originalParams;

  const originalLength = original.length;
  const optimizedLength = optimized.length;
  const lengthIncrease = (optimizedLength - originalLength) / Math.max(originalLength, 1);

  return Math.min(addedParams * 0.05 + lengthIncrease * 0.1, 0.3);
}

function countParameters(prompt: string): number {
  const systemParams = (prompt.match(/@\w+=\S+/g) || []).length;
  const styleTags = (prompt.match(/#\w+/g) || []).length;
  const functionModules = (prompt.match(/\$\w+/g) || []).length;
  const qualityParams = (prompt.match(/%\w+=\S+/g) || []).length;
  return systemParams + styleTags + functionModules + qualityParams;
}

export function batchIterate(
  initialPrompt: string,
  feedbackList: string[],
  maxIterations: number = 5
): { records: IterationRecord[]; finalPrompt: string } {
  const records: IterationRecord[] = [];
  let currentPrompt = initialPrompt;

  for (let i = 0; i < Math.min(feedbackList.length, maxIterations); i++) {
    const result = performIteration({
      originalPrompt: currentPrompt,
      feedback: feedbackList[i],
      currentIteration: i,
      maxIterations,
    });

    records.push(result.record);
    currentPrompt = result.optimizedPrompt;

    if (!result.shouldContinue) break;
  }

  return { records, finalPrompt: currentPrompt };
}